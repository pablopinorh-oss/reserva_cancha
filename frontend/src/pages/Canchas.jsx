import { useState } from "react";
import { supabase } from "../services/supabaseClient";

function Canchas({ canchas, reservas, setReservas, usuarioActual, cargarDatos }) {
  const [mensaje, setMensaje] = useState("");
  const [fechaReserva, setFechaReserva] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("Todas");

  const LIMITE_RESERVAS_ACTIVAS = 2;

  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const obtenerSemanaActual = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diferenciaLunes);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    return {
      inicioSemana: formatearFecha(lunes),
      finSemana: formatearFecha(domingo),
    };
  };

  const { inicioSemana, finSemana } = obtenerSemanaActual();

  const canchasFiltradas =
    filtroDisciplina === "Todas"
      ? canchas
      : canchas.filter((cancha) => cancha.disciplina === filtroDisciplina);

  const reservasDelUsuario = reservas.filter(
    (reserva) =>
      reserva.estudiante === usuarioActual.nombre &&
      reserva.estado === "Activa"
  );

  const reservarCancha = async (cancha, horario) => {
    const estudiante = usuarioActual.nombre;

    if (fechaReserva === "") {
      setMensaje("Debes seleccionar una fecha antes de reservar.");
      return;
    }

    if (fechaReserva < inicioSemana || fechaReserva > finSemana) {
      setMensaje("Solo puedes reservar dentro de la semana actual.");
      return;
    }

    if (cancha.estado !== "Disponible") {
      setMensaje("Esta cancha no se encuentra disponible actualmente.");
      return;
    }

    const reservaDuplicada = reservas.find(
      (reserva) =>
        reserva.cancha_id === cancha.id &&
        reserva.fecha === fechaReserva &&
        reserva.horario === horario &&
        reserva.estado === "Activa"
    );

    if (reservaDuplicada) {
      setMensaje(
        "Este horario ya está ocupado para la fecha seleccionada. Elige otro horario."
      );
      return;
    }

    const reservasActivasDelEstudiante = reservas.filter(
      (reserva) =>
        reserva.estudiante === estudiante && reserva.estado === "Activa"
    );

    if (reservasActivasDelEstudiante.length >= LIMITE_RESERVAS_ACTIVAS) {
      setMensaje(
        `No puedes tener más de ${LIMITE_RESERVAS_ACTIVAS} reservas activas. Cancela una reserva antes de crear otra.`
      );
      return;
    }

    const { error } = await supabase.from("reservas").insert([
      {
        cancha_id: cancha.id,
        cancha: cancha.nombre,
        disciplina: cancha.disciplina,
        ubicacion: cancha.ubicacion,
        fecha: fechaReserva,
        horario,
        estudiante,
        estado: "Activa",
      },
    ]);

    if (error) {
      console.log("Error al guardar reserva:", error);
      setMensaje("Error al guardar la reserva en Supabase.");
      return;
    }

    setMensaje(
      `Reserva realizada correctamente: ${cancha.nombre}, fecha ${fechaReserva}, horario ${horario}.`
    );

    cargarDatos();
  };

  const cancelarReserva = async (idReserva) => {
    const { error } = await supabase
      .from("reservas")
      .update({ estado: "Cancelada" })
      .eq("id", idReserva);

    if (error) {
      console.log("Error al cancelar reserva:", error);
      setMensaje("Error al cancelar la reserva.");
      return;
    }

    setMensaje(
      "Reserva cancelada correctamente. El horario vuelve a estar disponible."
    );

    cargarDatos();
  };

  return (
    <section>
      <h2>Canchas y horarios disponibles</h2>

      <div className="panel-controles">
        <div className="form-fecha">
          <label>Fecha de reserva</label>
          <input
            type="date"
            value={fechaReserva}
            min={inicioSemana}
            max={finSemana}
            onChange={(e) => setFechaReserva(e.target.value)}
          />
          <small>
            Solo se permiten reservas entre {inicioSemana} y {finSemana}.
          </small>
        </div>

        <div className="form-filtro">
          <label>Filtrar por disciplina</label>
          <select
            value={filtroDisciplina}
            onChange={(e) => setFiltroDisciplina(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="Fútbol">Fútbol</option>
            <option value="Básquetbol">Básquetbol</option>
            <option value="Tenis">Tenis</option>
            <option value="Voleibol">Voleibol</option>
            <option value="Pádel">Pádel</option>
          </select>
        </div>

        <div className="form-identificacion">
          <label>Regla de uso</label>
          <p>Máximo {LIMITE_RESERVAS_ACTIVAS} reservas activas por estudiante.</p>
        </div>
      </div>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="grid-canchas">
        {canchasFiltradas.map((cancha) => (
          <div className="card" key={cancha.id}>
            <h3>{cancha.nombre}</h3>

            <p>
              <strong>Disciplina:</strong> {cancha.disciplina}
            </p>

            <p>
              <strong>Ubicación:</strong> {cancha.ubicacion}
            </p>

            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={
                  cancha.estado === "Disponible"
                    ? "estado-disponible"
                    : "estado-no-disponible"
                }
              >
                {cancha.estado}
              </span>
            </p>

            <h4>Horarios</h4>

            {cancha.horarios.map((horario) => {
              const ocupado = reservas.some(
                (reserva) =>
                  reserva.cancha_id === cancha.id &&
                  reserva.fecha === fechaReserva &&
                  reserva.horario === horario &&
                  reserva.estado === "Activa"
              );

              const canchaNoDisponible = cancha.estado !== "Disponible";

              return (
                <div className="horario" key={horario}>
                  <span>{horario}</span>

                  <button
                    type="button"
                    onClick={() => reservarCancha(cancha, horario)}
                    disabled={ocupado || canchaNoDisponible}
                  >
                    {canchaNoDisponible
                      ? "No disponible"
                      : ocupado
                      ? "Ocupado"
                      : "Reservar"}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <h2>Mis reservas</h2>

      {reservasDelUsuario.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        <div className="grid-canchas">
          {reservasDelUsuario.map((reserva) => (
            <div className="card" key={reserva.id}>
              <h3>{reserva.cancha}</h3>

              <p>
                <strong>Disciplina:</strong> {reserva.disciplina}
              </p>

              <p>
                <strong>Fecha:</strong> {reserva.fecha}
              </p>

              <p>
                <strong>Horario:</strong> {reserva.horario}
              </p>

              <p>
                <strong>Estudiante:</strong> {reserva.estudiante}
              </p>

              <p>
                <strong>Estado:</strong> {reserva.estado}
              </p>

              <button
                type="button"
                className="btn-cancelar"
                onClick={() => cancelarReserva(reserva.id)}
              >
                Cancelar reserva
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Canchas;
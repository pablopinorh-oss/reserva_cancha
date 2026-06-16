import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import ResumenEstudiante from "../components/ResumenEstudiante";
import PanelControlesReserva from "../components/PanelControlesReserva";
import CanchaCard from "../components/CanchaCard";
import ReservaCard from "../components/ReservaCard";

function Canchas({ canchas, reservas, usuarioActual, cargarDatos }) {
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

  const disciplinasDisponibles = [
    "Todas",
    ...new Set(canchas.map((cancha) => cancha.disciplina)),
  ];

  const canchasFiltradas =
    filtroDisciplina === "Todas"
      ? canchas
      : canchas.filter((cancha) => cancha.disciplina === filtroDisciplina);

  const reservasDelUsuario = reservas
    .filter(
      (reserva) =>
        reserva.estudiante === usuarioActual.nombre &&
        reserva.estado === "Activa"
    )
    .sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return new Date(a.fecha) - new Date(b.fecha);
      }

      return a.horario.localeCompare(b.horario);
    });

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "Activa"
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

    const reservaDuplicada = reservas.some(
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

    if (reservasDelUsuario.length >= LIMITE_RESERVAS_ACTIVAS) {
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
      `Reserva realizada correctamente: ${cancha.nombre}, ${fechaReserva}, ${horario}.`
    );

    cargarDatos();
  };

  const cancelarReserva = async (reserva) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas cancelar la reserva de ${reserva.cancha} el ${reserva.fecha} a las ${reserva.horario}?`
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("reservas")
      .update({ estado: "Cancelada" })
      .eq("id", reserva.id);

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
      <div className="titulo-estudiante-simple">
        <h2>Reserva de canchas</h2>
        <p>
          Bienvenido, <strong>{usuarioActual.nombre}</strong>. Selecciona una
          fecha y revisa los horarios disponibles.
        </p>
      </div>

      <ResumenEstudiante
        reservasDelUsuario={reservasDelUsuario}
        limiteReservas={LIMITE_RESERVAS_ACTIVAS}
        fechaReserva={fechaReserva}
        canchasFiltradas={canchasFiltradas}
      />

      <PanelControlesReserva
        fechaReserva={fechaReserva}
        setFechaReserva={setFechaReserva}
        inicioSemana={inicioSemana}
        finSemana={finSemana}
        filtroDisciplina={filtroDisciplina}
        setFiltroDisciplina={setFiltroDisciplina}
        disciplinasDisponibles={disciplinasDisponibles}
        limiteReservas={LIMITE_RESERVAS_ACTIVAS}
      />

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="layout-estudiante">
        <div className="columna-canchas">
          <div className="seccion-titulo">
            <div>
              <h2>Canchas disponibles</h2>
              <p>
                Selecciona un horario disponible para la fecha escogida.
              </p>
            </div>
          </div>

          {canchasFiltradas.length === 0 ? (
            <p>No existen canchas registradas para esta disciplina.</p>
          ) : (
            <div className="grid-canchas grid-canchas-estudiante">
              {canchasFiltradas.map((cancha) => (
                <CanchaCard
                  key={cancha.id}
                  cancha={cancha}
                  fechaReserva={fechaReserva}
                  reservasActivas={reservasActivas}
                  reservasDelUsuario={reservasDelUsuario}
                  limiteReservas={LIMITE_RESERVAS_ACTIVAS}
                  reservarCancha={reservarCancha}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="panel-mis-reservas">
          <div className="panel-mis-reservas-header">
            <h2>Mis reservas</h2>
            <p>Reservas activas del estudiante.</p>
          </div>

          {reservasDelUsuario.length === 0 ? (
            <div className="estado-vacio estado-vacio-compacto">
              <h3>Sin reservas activas</h3>
              <p>Cuando reserves una cancha, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="lista-reservas-compacta">
              {reservasDelUsuario.map((reserva) => (
                <ReservaCard
                  key={reserva.id}
                  reserva={reserva}
                  cancelarReserva={cancelarReserva}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default Canchas;
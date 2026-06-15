import { useState } from "react";
import { supabase } from "../services/supabaseClient";

function Admin({ canchas, reservas, cargarDatos }) {
  const [mensaje, setMensaje] = useState("");
  const [nuevaCancha, setNuevaCancha] = useState({
    nombre: "",
    disciplina: "",
    ubicacion: "",
  });

  const totalCanchas = canchas.length;

  const canchasDisponibles = canchas.filter(
    (cancha) => cancha.estado === "Disponible"
  ).length;

  const canchasNoDisponibles = canchas.filter(
    (cancha) => cancha.estado === "No disponible"
  ).length;

  const totalReservas = reservas.length;

  const agregarCancha = async (e) => {
    e.preventDefault();

    if (
      nuevaCancha.nombre.trim() === "" ||
      nuevaCancha.disciplina.trim() === "" ||
      nuevaCancha.ubicacion.trim() === ""
    ) {
      setMensaje("Debes completar todos los campos para agregar una cancha.");
      return;
    }

    const { error } = await supabase.from("canchas").insert([
      {
        nombre: nuevaCancha.nombre.trim(),
        disciplina: nuevaCancha.disciplina.trim(),
        ubicacion: nuevaCancha.ubicacion.trim(),
        estado: "Disponible",
        horarios: ["10:00 - 11:00", "11:00 - 12:00", "15:00 - 16:00"],
      },
    ]);

    if (error) {
      console.log("Error al agregar cancha:", error);
      setMensaje("Error al agregar la cancha en Supabase.");
      return;
    }

    setNuevaCancha({
      nombre: "",
      disciplina: "",
      ubicacion: "",
    });

    setMensaje("Cancha agregada correctamente.");
    cargarDatos();
  };

  const cambiarEstadoCancha = async (cancha) => {
    const nuevoEstado =
      cancha.estado === "Disponible" ? "No disponible" : "Disponible";

    const { error } = await supabase
      .from("canchas")
      .update({ estado: nuevoEstado })
      .eq("id", cancha.id);

    if (error) {
      console.log("Error al cambiar estado:", error);
      setMensaje("Error al actualizar el estado de la cancha.");
      return;
    }

    setMensaje("Estado de la cancha actualizado correctamente.");
    cargarDatos();
  };

  const eliminarCancha = async (cancha) => {
    const tieneReservas = reservas.some(
      (reserva) => reserva.cancha_id === cancha.id && reserva.estado === "Activa"
    );

    if (tieneReservas) {
      setMensaje(
        "No se puede eliminar esta cancha porque tiene reservas activas registradas."
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar ${cancha.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("canchas")
      .delete()
      .eq("id", cancha.id);

    if (error) {
      console.log("Error al eliminar cancha:", error);
      setMensaje("Error al eliminar la cancha.");
      return;
    }

    setMensaje("Cancha eliminada correctamente.");
    cargarDatos();
  };

  return (
    <section>
      <h2>Panel de Administrador</h2>

      <div className="resumen-admin">
        <div className="resumen-card">
          <span>Total de canchas</span>
          <strong>{totalCanchas}</strong>
        </div>

        <div className="resumen-card">
          <span>Canchas disponibles</span>
          <strong>{canchasDisponibles}</strong>
        </div>

        <div className="resumen-card">
          <span>Canchas no disponibles</span>
          <strong>{canchasNoDisponibles}</strong>
        </div>

        <div className="resumen-card">
          <span>Reservas registradas</span>
          <strong>{totalReservas}</strong>
        </div>
      </div>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="admin-layout">
        <form className="card" onSubmit={agregarCancha}>
          <h3>Agregar nueva cancha</h3>

          <label>Nombre de la cancha</label>
          <input
            type="text"
            placeholder="Ej: Cancha de Pádel"
            value={nuevaCancha.nombre}
            onChange={(e) =>
              setNuevaCancha({
                ...nuevaCancha,
                nombre: e.target.value,
              })
            }
          />

          <label>Disciplina</label>
          <input
            type="text"
            placeholder="Ej: Pádel"
            value={nuevaCancha.disciplina}
            onChange={(e) =>
              setNuevaCancha({
                ...nuevaCancha,
                disciplina: e.target.value,
              })
            }
          />

          <label>Ubicación</label>
          <input
            type="text"
            placeholder="Ej: Sector exterior"
            value={nuevaCancha.ubicacion}
            onChange={(e) =>
              setNuevaCancha({
                ...nuevaCancha,
                ubicacion: e.target.value,
              })
            }
          />

          <button type="submit">Agregar cancha</button>
        </form>

        <div>
          <h3>Canchas registradas</h3>

          <div className="grid-canchas">
            {canchas.map((cancha) => (
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

                <div className="acciones-admin">
                  <button
                    type="button"
                    className={
                      cancha.estado === "Disponible"
                        ? "btn-cancelar"
                        : "btn-activar"
                    }
                    onClick={() => cambiarEstadoCancha(cancha)}
                  >
                    {cancha.estado === "Disponible"
                      ? "Deshabilitar"
                      : "Habilitar"}
                  </button>

                  <button
                    type="button"
                    className="btn-eliminar"
                    onClick={() => eliminarCancha(cancha)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2>Reservas registradas</h2>

      {reservas.length === 0 ? (
        <p>No existen reservas registradas.</p>
      ) : (
        <div className="grid-canchas">
          {reservas.map((reserva) => (
            <div className="card" key={reserva.id}>
              <h3>{reserva.cancha}</h3>

              <p>
                <strong>Estudiante:</strong> {reserva.estudiante}
              </p>

              <p>
                <strong>Fecha:</strong> {reserva.fecha}
              </p>

              <p>
                <strong>Horario:</strong> {reserva.horario}
              </p>

              <p>
                <strong>Estado:</strong> {reserva.estado}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Admin;
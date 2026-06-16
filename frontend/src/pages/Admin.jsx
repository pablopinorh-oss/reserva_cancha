import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import TablaCanchasAdmin from "../components/TablaCanchasAdmin";
import TablaReservasAdmin from "../components/TablaReservasAdmin";
import ResumenAdmin from "../components/ResumenAdmin";
import FormularioCancha from "../components/FormularioCancha";

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

  const totalReservas = reservas.filter(
    (reserva) => reserva.estado === "Activa"
  ).length;

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    if (a.estado === "Activa" && b.estado !== "Activa") return -1;
    if (a.estado !== "Activa" && b.estado === "Activa") return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

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

    const canchaDuplicada = canchas.some(
      (cancha) =>
        cancha.nombre.toLowerCase().trim() ===
        nuevaCancha.nombre.toLowerCase().trim()
    );

    if (canchaDuplicada) {
      setMensaje("Ya existe una cancha registrada con ese nombre.");
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
      (reserva) => reserva.cancha_id === cancha.id
    );

    if (tieneReservas) {
      setMensaje(
        "No se puede eliminar esta cancha porque tiene reservas registradas. Puedes deshabilitarla si ya no estará disponible."
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

  const cancelarReservaAdmin = async (reserva) => {
    if (reserva.estado !== "Activa") {
      setMensaje("Esta reserva ya se encuentra cancelada.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas cancelar la reserva de ${reserva.estudiante}?`
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

    setMensaje("Reserva cancelada correctamente por el administrador.");
    cargarDatos();
  };

  const reactivarReservaAdmin = async (reserva) => {
    if (reserva.estado === "Activa") {
      setMensaje("Esta reserva ya se encuentra activa.");
      return;
    }

    const existeReservaActiva = reservas.some(
      (reservaExistente) =>
        reservaExistente.id !== reserva.id &&
        reservaExistente.cancha_id === reserva.cancha_id &&
        reservaExistente.fecha === reserva.fecha &&
        reservaExistente.horario === reserva.horario &&
        reservaExistente.estado === "Activa"
    );

    if (existeReservaActiva) {
      setMensaje(
        "No se puede reactivar esta reserva porque el horario ya está ocupado por otra reserva activa."
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas reactivar la reserva de ${reserva.estudiante}?`
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("reservas")
      .update({ estado: "Activa" })
      .eq("id", reserva.id);

    if (error) {
      console.log("Error al reactivar reserva:", error);
      setMensaje("Error al reactivar la reserva.");
      return;
    }

    setMensaje("Reserva reactivada correctamente.");
    cargarDatos();
  };

  const eliminarReservaAdmin = async (reserva) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar definitivamente esta reserva?"
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", reserva.id);

    if (error) {
      console.log("Error al eliminar reserva:", error);
      setMensaje("Error al eliminar la reserva.");
      return;
    }

    setMensaje("Reserva eliminada correctamente.");
    cargarDatos();
  };

  return (
    <section>
      <div className="encabezado-seccion">
        <div>
          <h2>Panel de Administrador</h2>
          <p>
            Gestiona las canchas registradas, su disponibilidad y las reservas
            realizadas por los estudiantes.
          </p>
        </div>
      </div>

      <ResumenAdmin
        totalCanchas={totalCanchas}
        canchasDisponibles={canchasDisponibles}
        canchasNoDisponibles={canchasNoDisponibles}
        totalReservas={totalReservas}
      />

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="admin-layout">
        <FormularioCancha
          nuevaCancha={nuevaCancha}
          setNuevaCancha={setNuevaCancha}
          agregarCancha={agregarCancha}
        />

        <TablaCanchasAdmin
          canchas={canchas}
          reservas={reservas}
          cambiarEstadoCancha={cambiarEstadoCancha}
          eliminarCancha={eliminarCancha}
        />
      </div>

      <TablaReservasAdmin
        reservasOrdenadas={reservasOrdenadas}
        cancelarReservaAdmin={cancelarReservaAdmin}
        reactivarReservaAdmin={reactivarReservaAdmin}
        eliminarReservaAdmin={eliminarReservaAdmin}
      />
    </section>
  );
}

export default Admin;
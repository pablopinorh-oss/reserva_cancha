function ResumenEstudiante({
  reservasDelUsuario,
  limiteReservas,
  fechaReserva,
  canchasFiltradas,
}) {
  return (
    <div className="resumen-estudiante-compacto">
      <div className="item-resumen-estudiante">
        <span>Reservas activas</span>
        <strong>
          {reservasDelUsuario.length}/{limiteReservas}
        </strong>
      </div>

      <div className="item-resumen-estudiante">
        <span>Fecha</span>
        <strong>{fechaReserva || "Pendiente"}</strong>
      </div>

      <div className="item-resumen-estudiante">
        <span>Canchas visibles</span>
        <strong>{canchasFiltradas.length}</strong>
      </div>
    </div>
  );
}

export default ResumenEstudiante;
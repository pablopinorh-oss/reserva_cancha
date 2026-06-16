function ResumenAdmin({
  totalCanchas,
  canchasDisponibles,
  canchasNoDisponibles,
  totalReservas,
}) {
  return (
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
        <span>Reservas activas</span>
        <strong>{totalReservas}</strong>
      </div>
    </div>
  );
}

export default ResumenAdmin;
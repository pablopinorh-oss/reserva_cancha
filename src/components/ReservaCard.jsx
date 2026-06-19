function ReservaCard({ reserva, cancelarReserva }) {
  return (
    <div className="reserva-card-compacta">
      <div className="reserva-card-header">
        <div>
          <h3>{reserva.cancha}</h3>
          <p>
            {reserva.fecha} · {reserva.horario}
          </p>
        </div>

        <span className="estado-disponible">{reserva.estado}</span>
      </div>

      <div className="reserva-detalle-compacto">
        <span>{reserva.disciplina}</span>
        <span>{reserva.estudiante}</span>
      </div>

      <button
        type="button"
        className="btn-cancelar btn-cancelar-compacto"
        onClick={() => cancelarReserva(reserva)}
      >
        Cancelar reserva
      </button>
    </div>
  );
}

export default ReservaCard;
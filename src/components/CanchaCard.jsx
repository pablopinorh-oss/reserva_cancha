function CanchaCard({
  cancha,
  fechaReserva,
  reservasActivas,
  reservasDelUsuario,
  limiteReservas,
  reservarCancha,
}) {
  const canchaNoDisponible = cancha.estado !== "Disponible";
  const sinFecha = fechaReserva === "";
  const limiteAlcanzado = reservasDelUsuario.length >= limiteReservas;

  return (
    <div className="card cancha-card-mejorada">
      <div className="card-header">
        <div>
          <h3>{cancha.nombre}</h3>
          <p className="subtitulo-card">
            {cancha.disciplina} · {cancha.ubicacion}
          </p>
        </div>

        <span
          className={
            cancha.estado === "Disponible"
              ? "estado-disponible"
              : "estado-no-disponible"
          }
        >
          {cancha.estado}
        </span>
      </div>

      <div className="bloque-horarios">
        <h4>{fechaReserva ? `Horarios para ${fechaReserva}` : "Horarios"}</h4>

        {sinFecha ? (
          <div className="estado-fecha-pendiente">
            <strong>Selecciona una fecha</strong>
            <p>Luego podrás ver los horarios disponibles de esta cancha.</p>
          </div>
        ) : (
          <div className="horarios-grid">
            {cancha.horarios.map((horario) => {
              const ocupado = reservasActivas.some(
                (reserva) =>
                  reserva.cancha_id === cancha.id &&
                  reserva.fecha === fechaReserva &&
                  reserva.horario === horario
              );

              const botonDeshabilitado =
                ocupado || canchaNoDisponible || limiteAlcanzado;

              return (
                <button
                  key={horario}
                  type="button"
                  className={
                    ocupado
                      ? "horario-chip ocupado"
                      : botonDeshabilitado
                      ? "horario-chip bloqueado"
                      : "horario-chip disponible"
                  }
                  onClick={() => reservarCancha(cancha, horario)}
                  disabled={botonDeshabilitado}
                >
                  <span>{horario}</span>

                  <small>
                    {canchaNoDisponible
                      ? "No disponible"
                      : ocupado
                      ? "Ocupado"
                      : limiteAlcanzado
                      ? "Límite alcanzado"
                      : "Reservar"}
                  </small>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CanchaCard;
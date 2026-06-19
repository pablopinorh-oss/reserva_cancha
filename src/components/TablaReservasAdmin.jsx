function TablaReservasAdmin({
  reservasOrdenadas,
  cancelarReservaAdmin,
  reactivarReservaAdmin,
  eliminarReservaAdmin,
}) {
  return (
    <>
      <h2>Reservas registradas</h2>

      {reservasOrdenadas.length === 0 ? (
        <p>No existen reservas registradas.</p>
      ) : (
        <div className="tabla-contenedor panel-reservas">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Estudiante</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reservasOrdenadas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>
                    <strong>{reserva.cancha}</strong>
                  </td>

                  <td>{reserva.estudiante}</td>

                  <td>{reserva.fecha}</td>

                  <td>{reserva.horario}</td>

                  <td>
                    <span
                      className={
                        reserva.estado === "Activa"
                          ? "estado-disponible"
                          : "estado-no-disponible"
                      }
                    >
                      {reserva.estado}
                    </span>
                  </td>

                  <td>
                    <div className="acciones-tabla">
                      {reserva.estado === "Activa" ? (
                        <button
                          type="button"
                          className="btn-cancelar"
                          onClick={() => cancelarReservaAdmin(reserva)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-activar"
                          onClick={() => reactivarReservaAdmin(reserva)}
                        >
                          Reactivar
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => eliminarReservaAdmin(reserva)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default TablaReservasAdmin;
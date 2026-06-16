function TablaCanchasAdmin({
  canchas,
  reservas,
  cambiarEstadoCancha,
  eliminarCancha,
}) {
  return (
    <div className="admin-panel-listado">
      <div className="admin-panel-header">
        <div>
          <h3>Canchas registradas</h3>
          <p>
            Visualiza el estado, cantidad de reservas asociadas y acciones
            disponibles por cancha.
          </p>
        </div>
      </div>

      {canchas.length === 0 ? (
        <p>No existen canchas registradas.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Disciplina</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Reservas</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {canchas.map((cancha) => {
                const reservasAsociadas = reservas.filter(
                  (reserva) => reserva.cancha_id === cancha.id
                ).length;

                return (
                  <tr key={cancha.id}>
                    <td>
                      <strong>{cancha.nombre}</strong>
                    </td>

                    <td>{cancha.disciplina}</td>

                    <td>{cancha.ubicacion}</td>

                    <td>
                      <span
                        className={
                          cancha.estado === "Disponible"
                            ? "estado-disponible"
                            : "estado-no-disponible"
                        }
                      >
                        {cancha.estado}
                      </span>
                    </td>

                    <td>
                      <span className="contador-tabla">
                        {reservasAsociadas}
                      </span>
                    </td>

                    <td>
                      <div className="acciones-tabla">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TablaCanchasAdmin;
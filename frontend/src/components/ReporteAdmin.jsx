function ReporteAdmin({ reservas }) {
  const totalReservas = reservas.length;

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "Activa"
  ).length;

  const reservasCanceladas = reservas.filter(
    (reserva) => reserva.estado === "Cancelada"
  ).length;

  const contarPorCampo = (campo) => {
    return reservas.reduce((acumulador, reserva) => {
      const valor = reserva[campo] || "Sin información";
      acumulador[valor] = (acumulador[valor] || 0) + 1;
      return acumulador;
    }, {});
  };

  const obtenerMasReservado = (datos) => {
    const entradas = Object.entries(datos);

    if (entradas.length === 0) {
      return {
        nombre: "Sin datos",
        total: 0,
      };
    }

    const [nombre, total] = entradas.sort((a, b) => b[1] - a[1])[0];

    return {
      nombre,
      total,
    };
  };

  const canchaMasReservada = obtenerMasReservado(contarPorCampo("cancha"));
  const disciplinaMasReservada = obtenerMasReservado(
    contarPorCampo("disciplina")
  );

  return (
    <div className="reporte-admin">
      <div className="reporte-admin-header">
        <h3>Reporte de uso</h3>
        <p>
          Resumen básico de reservas registradas para apoyar la gestión
          administrativa.
        </p>
      </div>

      <div className="reporte-grid">
        <div className="reporte-card">
          <span>Total reservas</span>
          <strong>{totalReservas}</strong>
        </div>

        <div className="reporte-card">
          <span>Reservas activas</span>
          <strong>{reservasActivas}</strong>
        </div>

        <div className="reporte-card">
          <span>Reservas canceladas</span>
          <strong>{reservasCanceladas}</strong>
        </div>

        <div className="reporte-card reporte-card-destacado">
          <span>Cancha con mayor demanda</span>
          <strong>{canchaMasReservada.nombre}</strong>
          <small>{canchaMasReservada.total} reserva(s)</small>
        </div>

        <div className="reporte-card reporte-card-destacado">
          <span>Disciplina más reservada</span>
          <strong>{disciplinaMasReservada.nombre}</strong>
          <small>{disciplinaMasReservada.total} reserva(s)</small>
        </div>
      </div>
    </div>
  );
}

export default ReporteAdmin;
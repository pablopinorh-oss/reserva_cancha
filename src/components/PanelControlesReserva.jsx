function PanelControlesReserva({
  fechaReserva,
  setFechaReserva,
  inicioSemana,
  finSemana,
  filtroDisciplina,
  setFiltroDisciplina,
  disciplinasDisponibles,
  limiteReservas,
}) {
  return (
    <div className="barra-reserva-compacta">
      <div className="campo-reserva">
        <label>Fecha</label>
        <input
          type="date"
          value={fechaReserva}
          min={inicioSemana}
          max={finSemana}
          onChange={(e) => setFechaReserva(e.target.value)}
        />
      </div>

      <div className="campo-reserva">
        <label>Disciplina</label>
        <select
          value={filtroDisciplina}
          onChange={(e) => setFiltroDisciplina(e.target.value)}
        >
          {disciplinasDisponibles.map((disciplina) => (
            <option key={disciplina} value={disciplina}>
              {disciplina}
            </option>
          ))}
        </select>
      </div>

      <div className="regla-reserva-compacta">
        <span>Regla de uso</span>
        <strong>Máximo {limiteReservas} reservas activas</strong>
        <small>
          Semana actual: {inicioSemana} al {finSemana}
        </small>
      </div>
    </div>
  );
}

export default PanelControlesReserva;
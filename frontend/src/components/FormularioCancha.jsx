function FormularioCancha({ nuevaCancha, setNuevaCancha, agregarCancha }) {
  return (
    <form className="card admin-form-card" onSubmit={agregarCancha}>
      <h3>Agregar nueva cancha</h3>

      <p className="texto-ayuda">
        Registra una nueva cancha deportiva en el sistema. Por defecto quedará
        disponible para reservas.
      </p>

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
  );
}

export default FormularioCancha;
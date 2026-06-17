import { useState } from "react";

function Login({ setUsuarioActual }) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = (e) => {
    e.preventDefault();

    if (nombre.trim() === "") {
      setMensaje("Debes ingresar tu identificación.");
      return;
    }

    const usuario = {
      nombre: nombre.trim(),
      rol,
    };

    setUsuarioActual(usuario);
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <h2>Ingreso al Sistema</h2>
        <p>
          Ingresa tus datos para acceder al sistema de reserva de canchas
          deportivas.
        </p>

        {mensaje && <p className="mensaje-error">{mensaje}</p>}

        <form onSubmit={iniciarSesion}>
          <label>Correo Institucional o Identificación</label>
          <input
            type="text"
            placeholder="Ej: 21123456-7"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>Rol de usuario</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="estudiante">Estudiante</option>
            <option value="administrador">Administrador</option>
          </select>

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </section>
  );
}

export default Login;

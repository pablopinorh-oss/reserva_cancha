import { useState } from "react";
import { supabase } from "../services/supabaseClient";

function Login({ setUsuarioActual }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setMensaje("Debes ingresar tu correo y contraseña.");
      return;
    }

    setCargando(true);
    setMensaje("");

    // Llamada a la API de Supabase para iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setMensaje("Error al iniciar sesión: " + error.message);
      setCargando(false);
      return;
    }

// Si la autenticación es exitosa, data.user contiene el ID del usuario
    if (data.user) {
      
      // 1. Consultamos a la base de datos qué rol tiene este ID
      const { data: perfil, error: errorPerfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', data.user.id)
        .single(); // .single() trae un solo objeto en lugar de un arreglo

      if (errorPerfil && errorPerfil.code !== 'PGRST116') {
        // PGRST116 significa que no encontró resultados, lo cual es normal si es un estudiante nuevo
        console.error("Error al buscar el perfil:", errorPerfil);
      }

      // 2. Si encontró el perfil en la base de datos, usamos ese rol. 
      // Si no lo encontró, por seguridad asignamos "estudiante".
      const rolAsignado = perfil?.rol ? perfil.rol : "estudiante";

      // 3. Armamos el objeto para App.jsx
      const usuarioFormateado = {
        nombre: data.user.email, 
        rol: rolAsignado,
        id: data.user.id
      };

      // 4. Actualizamos el estado de la aplicación
      setUsuarioActual(usuarioFormateado);
    }
    
    setCargando(false);
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <h2>Ingreso al Sistema</h2>
        <p>
          Ingresa tus credenciales para acceder al sistema de reserva de canchas deportivas.
        </p>

        {mensaje && <p className="mensaje-error" style={{ color: 'red' }}>{mensaje}</p>}

        <form onSubmit={iniciarSesion}>
          <label>Correo Institucional</label>
          <input
            type="email"
            placeholder="Ej: usuario@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando}
          />

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
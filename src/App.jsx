import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Canchas from "./pages/Canchas";
import Admin from "./pages/Admin";
import { supabase } from "./services/supabaseClient";
import "./App.css";

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  
  // Separamos los tiempos de carga
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [verificandoSesion, setVerificandoSesion] = useState(true); 
  
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setCargandoDatos(true);
    setError("");

    // 1. Cargar canchas (Se mantiene igual)
    const { data: canchasData, error: errorCanchas } = await supabase
      .from("canchas")
      .select("*")
      .order("id", { ascending: true });

    if (errorCanchas) {
      setError("Error al cargar las canchas desde Supabase.");
    }

    // 2. OPTIMIZACIÓN: Calculamos la fecha de hace 7 días
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
    const fechaLimite = haceUnaSemana.toISOString().split("T")[0];

    // 3. Cargar reservas filtradas y ordenadas eficientemente
    const { data: reservasData, error: errorReservas } = await supabase
      .from("reservas")
      .select("*")
      .gte("fecha", fechaLimite) // Trae solo reservas de hace 7 días o más nuevas
      .order("fecha", { ascending: true }) // Ordena por fecha
      .order("horario", { ascending: true }); // Luego ordena por hora

    if (errorReservas) {
      setError("Error al cargar las reservas desde Supabase.");
    }

    setCanchas(canchasData || []);
    setReservas(reservasData || []);
    setCargandoDatos(false);
  };

  // Función para buscar el rol del usuario en la base de datos
  const cargarPerfilUsuario = async (user) => {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error al obtener el perfil:", error);
    }

    const rolAsignado = perfil?.rol ? perfil.rol : "estudiante";

    setUsuarioActual({
      nombre: user.email,
      rol: rolAsignado,
      id: user.id
    });
    
    // Le avisamos a React que ya terminamos de verificar quién es
    setVerificandoSesion(false);
  };

  useEffect(() => {
    cargarDatos();

    // 1. Revisar la memoria del navegador al abrir la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        cargarPerfilUsuario(session.user);
      } else {
        // Si no hay sesión, terminamos de verificar inmediatamente
        setVerificandoSesion(false); 
      }
    });

    // 2. Escuchar cambios (cuando inicia o cierra sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        cargarPerfilUsuario(session.user);
      } else {
        setUsuarioActual(null);
        setVerificandoSesion(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuarioActual(null);
  };

  // CONDICIÓN ACTUALIZADA: Esperamos a que ambas cargas terminen
  if (cargandoDatos || verificandoSesion) {
    return (
      <main>
        <h1>Sistema de Reserva de Canchas Deportivas</h1>
        <p>Cargando aplicación y verificando credenciales...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Sistema de Reserva de Canchas Deportivas</h1>
        <p className="mensaje-error">{error}</p>
      </main>
    );
  }

  if (!usuarioActual) {
    return (
      <main>
        <h1>Sistema de Reserva de Canchas Deportivas</h1>
        <Login setUsuarioActual={setUsuarioActual} />
      </main>
    );
  }

  return (
    <main>
      <h1>Sistema de Reserva de Canchas Deportivas</h1>

      <div className="barra-usuario">
        <div>
          <strong>Usuario:</strong> {usuarioActual.nombre} |{" "}
          <strong>Rol:</strong>{" "}
          {usuarioActual.rol === "administrador"
            ? "Administrador"
            : "Estudiante"}
        </div>

        <button type="button" className="btn-cerrar" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      {usuarioActual.rol === "estudiante" ? (
        <>
          <p>
            Consulta horarios disponibles, reserva una cancha y revisa tus
            reservas activas.
          </p>

          <Canchas
            canchas={canchas}
            reservas={reservas}
            usuarioActual={usuarioActual}
            cargarDatos={cargarDatos}
          />
        </>
      ) : (
        <>
          <p>
            Administra canchas, disponibilidad y revisa las reservas
            registradas.
          </p>

          <Admin
            canchas={canchas}
            setCanchas={setCanchas}
            reservas={reservas}
            cargarDatos={cargarDatos}
          />
        </>
      )}
    </main>
  );
}

export default App;
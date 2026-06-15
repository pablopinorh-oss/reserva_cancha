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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    const { data: canchasData, error: errorCanchas } = await supabase
      .from("canchas")
      .select("*")
      .order("id", { ascending: true });

    if (errorCanchas) {
      setError("Error al cargar las canchas desde Supabase.");
      setCargando(false);
      return;
    }

    const { data: reservasData, error: errorReservas } = await supabase
      .from("reservas")
      .select("*")
      .order("id", { ascending: true });

    if (errorReservas) {
      setError("Error al cargar las reservas desde Supabase.");
      setCargando(false);
      return;
    }

    setCanchas(canchasData || []);
    setReservas(reservasData || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cerrarSesion = () => {
    setUsuarioActual(null);
  };

  if (cargando) {
    return (
      <main>
        <h1>Sistema de Reserva de Canchas Deportivas</h1>
        <p>Cargando datos desde Supabase...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Sistema de Reserva de Canchas Deportivas</h1>
        <p className="mensaje">{error}</p>
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
            setReservas={setReservas}
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
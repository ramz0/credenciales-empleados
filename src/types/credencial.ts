export interface Vigencia {
  inicio: string;
  fin: string;
}

export interface EmpleadoCredencial {
  nombre: string;
  puesto: string;
  vigencia: Vigencia;
}

export interface CredencialProps {
  empleado: EmpleadoCredencial;
  logoUrl: string;
  nombreEmpresa: string;
}

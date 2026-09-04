import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center"><div className="text-center"><h1 className="text-4xl font-bold">404</h1><Link to="/">Volver al inicio</Link></div></main>;
}

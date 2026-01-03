import { NavLink } from "../reuse";

function Navbar() {
  return (
    <div className="flex flex-row justify-center py-2 sticky top-0 bg-black z-50">
      <div className="float-left max-w-2xl w-full flex gap-4 ">
        <NavLink href="/">/home</NavLink>
        <NavLink href="/about">/about</NavLink>
        <NavLink href="/projects">/projects</NavLink>
      </div>
    </div>
  );
}

export default Navbar;

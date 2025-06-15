
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="bg-cyan-500 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-cyan-500 font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-semibold">Meraki WSC</h1>
        </div>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search Home"
            className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

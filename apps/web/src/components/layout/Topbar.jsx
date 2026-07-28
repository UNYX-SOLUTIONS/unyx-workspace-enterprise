import SearchBar from './SearchBar';
import NotificationButton from './NotificationButton';
import UserMenu from './UserMenu';

export default function Topbar({onMenuClick}){
 return(
 <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
   <button onClick={onMenuClick} className="md:hidden">☰</button>
   <SearchBar/>
   <div className="flex items-center gap-3">
     <NotificationButton/>
     <UserMenu/>
   </div>
 </header>);
}
import Logo from '../logo/Logo.js'
function Header() {
    return (
        <header className='relative z-10 p4'>
        <div className='mx-auto flex justify-between items-center'>
            <Logo/>
            <div className="hidden md:flex items-center space-x-4">
                    <a href="#" className="border-2 border-[#FFC107] text-[#FFC107] px-4 py-2 rounded-full hover:bg-[#FFC107] hover:text-[#0B2545] transition-colors">
                        About us
                    </a>
                    <a href="#" className="bg-[#FFC107] text-[#0B2545] font-bold px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                        Login
                    </a>
                </div>
        </div>
        </header>
        
    )
}

export default Header
import { PanelRightOpen } from 'lucide-react'

export default function RightSidebarToggle({ isOpen, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="hidden lg:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
            <PanelRightOpen
                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                    }`}
            />
        </button>
    )
}
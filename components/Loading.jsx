import { FaSpinner } from "react-icons/fa";

const Loading = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen space-y-4">
            <FaSpinner className="animate-spin text-4xl text-blue-400" />
            <span className="text-lg font-semibold text-gray-700">Loading...</span>
        </div>
    );
}

export default Loading
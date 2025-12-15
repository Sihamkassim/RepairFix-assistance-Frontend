import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">RepairFix Assistant</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <SignedOut>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to RepairFix Assistant
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to access the application
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome Back! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              You are now signed in and can access all features of RepairFix Assistant.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Dashboard</h3>
                <p className="text-gray-600">View your repair requests and status</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">New Request</h3>
                <p className="text-gray-600">Submit a new repair request</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">History</h3>
                <p className="text-gray-600">View your past repair history</p>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  )
}

export default App

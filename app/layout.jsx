import Nav from '@components/Nav';
import '@styles/globals.css';
import { AuthProvider } from '../components/Providers';

// The metadata object contains the title and description of the application.
export const metadata = {
    title: "U - Job Finder",
    description: "U Job Finder is the perfect place to find your dream job.",
}

// The RootLayout component is a layout component that wraps the entire application. 
// It includes the Nav component and the AuthProvider component.
// The AuthProvider component is a custom provider that wraps the entire application 
// and provides the user session to all components. 
// The Nav component is a navigation bar that is displayed at the top of the page. 
// The RootLayout component is used to wrap the entire application and provide the layout for all pages.
const RootLayout = ({ children }) => (
    <html lang='en'>
      <body>
          <main className='app'>
            <AuthProvider>
              <Nav />
              {children}
            </AuthProvider>
          </main>
      </body>
    </html>
  );
  
  export default RootLayout;
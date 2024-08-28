// 'use client'

const InitAdminUser = async () => {

    // Check if the admin already exists in the database before creating him
    try {
        
        console.log("Initializing Admin user...");

        // Admin user object
        const adminUser = {
            admin: true,
            name: "Admin",
            surname: "Admin",
            email: "admin@u.com",
            phone_number: "123456789",
            password: "admin123",
            path: "/assets/logo_images/admin@u.com_admin_logo.jpg",
            post_counter: 0,
            listing_counter: 0
        };

        // Fetch request to check if the admin already exists
        console.log("cwd: ", process.cwd());
        const resUserExists = await fetch("/api/userExists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: adminUser.email })
        });

        const {user} = await resUserExists.json();

        if (user) {
            console.log("Admin already exists");
            return;
        }

        // Fetch request to register the admin if the admin does not exist (checked before)
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                admin: adminUser.admin,
                name: adminUser.name, 
                surname: adminUser.surname, 
                email: adminUser.email, 
                phone_number: adminUser.phone_number, 
                password: adminUser.password, 
                path: adminUser.path,
                post_counter: adminUser.post_counter,
                listing_counter: adminUser.listing_counter
            })
        });

        // If the Admin is successfully registered, reset the form and navigate to the home page
        if (res.ok) {
            console.log("Admin intitialized successfully.");
        } else {
            console.log("Admin initialization failed.");
        }
    } catch (error) {
        console.log("An error occurred while initializing the Admin: ", error);
    }
};

export default InitAdminUser;
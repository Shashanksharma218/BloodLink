# BloodLink Una - Blood Donation Management System

BloodLink Una is a web application designed to bridge the gap between voluntary blood donors and the Government Hospital in Una, Himachal Pradesh. The platform provides an easy way for donors to register and manage their availability, while allowing the hospital to efficiently find and request blood donations in times of need.

## About The Project

This project was created to serve the local community by providing a centralized, reliable system for blood donation management. It aims to streamline the process of finding available donors, reducing delays during emergencies, and fostering a community of voluntary donors.

### Key Features

- **Donor Registration:** A simple and quick form for volunteers to register as donors.
    
- **Donor Dashboard:** Donors can manage their availability status and view donation requests.
    
- **Hospital Portal:** A secure login for hospital staff to manage blood requests.
    
- **Real-time Search:** Hospitals can search for available donors by blood group.
    
- **Request System:** Hospitals can send donation requests directly to matching donors.
    

### Built With

- [**React.js**](https://reactjs.org/ "null") - A JavaScript library for building user interfaces.
    
- [**React Router**](https://reactrouter.com/ "null") - For handling client-side routing.
    
- [**Tailwind CSS**](https://tailwindcss.com/ "null") - A utility-first CSS framework for rapid UI development.
    
- [**Parcel**](https://parceljs.org/ "null") - A blazing fast, zero-configuration web application bundler.
    

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- **npm**
    
    ```
    npm install npm@latest -g
    
    ```
    

### Installation

1. Clone the repository to your local machine.
    
    ```
    git clone [https://github.com/Shashanksharma218/BloodLink.git](https://github.com/Shashanksharma218/BloodLink.git)
    
    ```
    
2. Navigate into the project directory.
    
    ```
    cd BloodLink
    
    ```
    
3. Install NPM packages.
    
    ```
    npm install
    
    ```
    

## Running the Application

To run the app in development mode, use the following command. This will open the app in your default browser.

```
npm start

```

## Folder Structure

The project follows a standard React application structure:

```
/
├── README.md
├── backend
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── config
│       │   └── database.js
│       └── models
│           └── Donor.js
└── frontend
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── src
        ├── App.js
        ├── assets
        │   ├── about-illustration.svg
        │   ├── blood-drop.png
        │   ├── contact-illustration.svg
        │   ├── donate-icon.png
        │   ├── donate-icon.svg
        │   ├── donation-illustration.png
        │   ├── form-illustration.svg
        │   ├── hero-illustration.png
        │   ├── login-illustration.svg
        │   ├── notify-icon.svg
        │   ├── register-icon.jpg
        │   └── register-icon.svg
        ├── components
        │   ├── AboutPage.js
        │   ├── ContactPage.js
        │   ├── DonorDashboardPage.js
        │   ├── DonorLoginModal.js
        │   ├── DonorRegistrationPage.js
        │   ├── Footer.js
        │   ├── Header.js
        │   ├── HomePage.js
        │   ├── HospitalDashboardPage.js
        │   └── HospitalLoginPage.js
        ├── context
        │   └── AuthContext.js
        ├── index.css
        └── index.js

```
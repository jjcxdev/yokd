# YOKD

## Overview

YOKD is a web application designed to help users manage and track their workout routines. The app allows users to start a workout session, log their exercises, sets, reps, weights, and notes, and track their progress over time. It also includes a rest timer feature to ensure users take appropriate breaks between sets.

## Features

- **Start Routine**: Begin a workout session from your dashboard.
- **Exercise Cards**: Display sets, reps, weights, and notes for each exercise.
- **Rest Timer**: Automatically triggers a rest timer when a set is marked as complete.
- **Session Timer**: Tracks the total duration of the workout session.
- **Finish Button**: Ends the session and saves all data, making it available for future sessions.

## How to Use

1. **Start a Routine**: From your dashboard, select a routine to start. The app will load and route you to the session page.
2. **Log Exercises**: Each exercise card will display the sets, reps, weights, and notes from the routine. You can update these values as you complete your workout.
3. **Mark Sets as Complete**: Use the checkbox to mark each set as complete. This will trigger the rest timer.
4. **Rest Timer**: The rest timer will count down the rest period between sets. A chime will play when the rest period is over.
5. **Finish Session**: Click the "Finish" button to end the session. The app will save all your data, including the total duration, sets, reps, weights, and notes. This data will be used as the initial data for the next time you run the same routine.

## Installation

To run the app locally, follow these steps:

1. **Clone the repository**:

   ```sh
   git clone https://github.com/jjcxdev/yokd.git
   cd yokd
   ```

2. **Install dependencies**:

   ```sh
   pnpm install
   ```

3. **Start the development server**:

   ```sh
   pnpm start
   ```

4. **Open the app in your browser**:
   ```sh
   http://localhost:3000
   ```

## Technologies Used

- **React**: For building the user interface.
- **TypeScript**: For type-safe JavaScript.
- **Node.js**: For the backend server.
- **SQLite**: For the database.
- **Clerk**: For Auth.
- **TailwindCSS**: For styling the app.

## Contributing

If you would like to contribute to the project, please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**.
4. **Commit your changes**:
   ```sh
   git commit -m 'Add some feature'
   ```
5. **Push to the branch**:
   ```sh
   git push origin feature/your-feature-name
   ```
6. **Create a pull request**.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

If you have any questions or feedback, please feel free to contact us at [j@jjcxdev].

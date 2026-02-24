# CashFlow Portal

## Overview
The CashFlow Portal is an Angular application designed to manage and track income and expenses. It provides users with a comprehensive dashboard to view their financial summary, manage income and expenses, and track transactions.

## Features
- **Dashboard**: Displays an overview of total income, expenses, and net balance.
- **Income Management**: Add, remove, and view income sources.
- **Expense Management**: Add, remove, and view expenses.
- **Transaction Tracking**: View all transactions with options to filter and sort.

## Project Structure
```
cashflow-portal
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── dashboard
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── income
│   │   │   │   └── income.component.ts
│   │   │   ├── expenses
│   │   │   │   └── expenses.component.ts
│   │   │   └── transactions
│   │   │       └── transactions.component.ts
│   │   ├── services
│   │   │   ├── income.service.ts
│   │   │   ├── expenses.service.ts
│   │   │   └── transactions.service.ts
│   │   ├── models
│   │   │   ├── income.model.ts
│   │   │   ├── expense.model.ts
│   │   │   └── transaction.model.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets
│   ├── environments
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.
- Angular CLI installed globally.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd cashflow-portal
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
ng serve
```
Then open your browser and navigate to `http://localhost:4200`.

### Building for Production
To build the application for production, run:
```
ng build --prod
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
# Notebook & Checklist App

A modern, powerful notebook and checklist application built with React, TypeScript, Supabase, and Tailwind CSS. Organize your thoughts, manage your tasks, and keep everything in sync across devices.

## Features

### Core Features
- 📓 **Rich Note Taking**: Create and organize notes with beautiful formatting
- ✅ **Smart Checklists**: Manage tasks with interactive checklist functionality
- 📚 **Notebook Organization**: Organize notes into separate notebooks
- 🔐 **Secure Authentication**: Built-in user authentication with Supabase
- ☁️ **Cloud Sync**: Real-time synchronization across all your devices
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS

### Advanced Features
- 🏷️ **Tags & Categories**: Organize notes with flexible tagging system
- 🔍 **Search & Filter**: Quickly find notes with powerful search
- 📌 **Pin Important Notes**: Pin frequently accessed notes to the top
- 🌓 **Dark Mode**: Easy on the eyes with dark mode support
- 🚀 **Performance**: Optimized with React Query for smooth interactions

## Tech Stack

- **Frontend**
  - React 18.2
  - TypeScript 5.2
  - Tailwind CSS 3.3
  - React Router 6
  - Vite 5

- **Backend & Database**
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Supabase Realtime

- **State Management & Data**
  - React Query (TanStack Query)
  - React Context API

- **UI & UX**
  - React Hot Toast (Notifications)
  - Heroicons (Icon library)
  - React Quill (Rich text editor)

## Project Structure

```
notebook-app/
├── public/                 # Static files & PWA manifest
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useNotebooks.ts
│   │   ├── useNotes.ts
│   │   └── useChecklistItems.ts
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── Dashboard.tsx
│   │   ├── NotebookView.tsx
│   │   └── NoteEditor.tsx
│   ├── services/          # External API integrations
│   │   └── supabase.ts
│   ├── styles/            # Global styles
│   │   └── index.css
│   ├── types/             # TypeScript types
│   │   └── database.ts
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── supabase/
│   └── migrations/        # Database migrations
│       └── 001_initial_schema.sql
├── .env.example           # Environment variables example
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- A Supabase account (free tier available at https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notebook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

4. **Create .env.local file**
   ```bash
   cp .env.example .env.local
   ```

5. **Fill in Supabase credentials**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open in your browser at `http://localhost:3000`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint -- --fix
```

## Database Schema

The app uses PostgreSQL with the following main tables:

- **profiles**: User profile information
- **notebooks**: User's notebooks
- **notes**: Individual notes within notebooks
- **checklist_items**: Items within checklist-type notes
- **tags**: User-created tags
- **note_tags**: Junction table for note-tag relationships

All tables include:
- Row Level Security (RLS) policies
- Automatic timestamp management (created_at, updated_at)
- Proper indexing for performance

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Authentication Flow

1. User signs up or logs in with email/password
2. Supabase authenticates and returns JWT token
3. Token stored in local storage and used for API requests
4. Authentication state managed via React Context
5. Protected routes redirect unauthenticated users to login

## Usage Guide

### Creating a Notebook

1. Click "New Notebook" button on the Dashboard
2. Enter a notebook title
3. Click "Create" to save

### Creating Notes

1. Navigate to a notebook
2. Click "New Note" button
3. Add a title and content
4. Changes are auto-saved

### Using Checklists

1. Create a note and choose "Checklist" mode
2. Add checklist items
3. Click items to mark as complete
4. Reorder items by dragging

### Organizing with Tags

1. Add tags to notes for easy categorization
2. Filter notes by tags
3. Create custom colors for tags

## Development Guidelines

### Component Structure

```typescript
// Use function components with hooks
export default function MyComponent() {
  const { data, isLoading, error } = useQuery(...)

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Data Fetching

```typescript
// Use React Query hooks
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: async () => { /* ... */ }
})

// Use mutations for changes
const mutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onSuccess: () => { /* ... */ }
})
```

### Styling

- Use Tailwind CSS classes for styling
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Prefer utility classes over custom CSS

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

## Troubleshooting

### "Missing Supabase environment variables"

Make sure `.env.local` exists in the project root with:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Database Connection Errors

1. Verify Supabase URL and keys are correct
2. Ensure RLS policies are properly configured
3. Check that migrations have been run

### Authentication Issues

1. Verify email is confirmed in Supabase
2. Check that Auth credentials are valid
3. Clear browser localStorage and try again

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap

- [ ] Collaborative note sharing
- [ ] Export to PDF/Markdown
- [ ] Integration with Google Calendar
- [ ] Mobile app (React Native)
- [ ] Offline support with service workers
- [ ] Advanced search with filters
- [ ] Note versioning and history
- [ ] Team workspaces

## Acknowledgments

- [Supabase](https://supabase.com) for the excellent backend platform
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [React Query](https://tanstack.com/query) for data fetching and caching
- [Heroicons](https://heroicons.com) for beautiful icons
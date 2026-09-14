# Contributing to Stock Scanner

Thank you for your interest in contributing! 🎉

## How to Contribute

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/stock-scanner.git
cd stock-scanner
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your Upstox credentials to .env

# Setup database
npx drizzle-kit push

# Run development server
npm run dev
```

### 3. Make Your Changes

- Create a new branch: `git checkout -b feature/your-feature-name`
- Make your changes
- Test thoroughly
- Commit with clear messages

### 4. Commit Guidelines

Follow conventional commits:

```
feat: Add new volume filter option
fix: Resolve timeframe switching bug
docs: Update README with new examples
style: Format code with Prettier
refactor: Simplify scanner logic
test: Add tests for API routes
```

### 5. Submit Pull Request

- Push to your fork: `git push origin feature/your-feature-name`
- Open a Pull Request on GitHub
- Describe your changes clearly
- Wait for review

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

### Testing

Before submitting:

```bash
# Type checking
npm run typecheck

# Build test
npm run build
```

### File Structure

```
src/
├── app/           # Next.js pages and API routes
├── lib/           # Utility functions and helpers
├── components/    # React components
├── db/            # Database schema and queries
└── types/         # TypeScript type definitions
```

## Ideas for Contributions

### Features to Add

- [ ] More stock symbols (add your favorites!)
- [ ] Export results to CSV
- [ ] Price alerts/notifications
- [ ] Historical scan results view
- [ ] Mobile-responsive improvements
- [ ] Dark/light theme toggle
- [ ] More technical indicators (RSI, MACD, etc.)
- [ ] Customizable watchlists
- [ ] Sound alerts for new matches
- [ ] Email notifications

### Improvements Needed

- [ ] Better error handling
- [ ] Automated token refresh
- [ ] Unit tests
- [ ] Performance optimization
- [ ] Better loading states
- [ ] Accessibility improvements
- [ ] Documentation updates
- [ ] Code comments

### Bug Fixes

- Check GitHub Issues for open bugs
- Reproduce the issue
- Fix and test
- Submit PR

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, PR will be merged
4. Your changes will be deployed!

## Questions?

- Open a GitHub Issue
- Tag with `question` label
- We'll respond ASAP

## Recognition

Contributors will be added to the README.md credits section!

Thank you for making this project better! 🚀

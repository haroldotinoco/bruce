# Frontend Agent Constraints

## Component Standards
- All components must be functional (no class components)
- Components must accept TypeScript props with explicit typing
- Maximum component size: 200 lines (encourage composition)
- All components must have JSDoc comments describing purpose and props
- Reusable components must not contain business logic

## State Management
- Use Context API for global state
- Local component state only for UI state (open/closed modals)
- No prop drilling beyond 2 levels
- Zustand for complex client-side state management
- All state mutations must be immutable

## Styling Requirements
- Tailwind CSS for utility-based styling
- Design tokens must be defined as CSS variables
- No inline styles (except dynamic values)
- Responsive design mobile-first approach
- All colors must come from design token palette

## Accessibility Requirements
- WCAG AA compliance mandatory
- All interactive elements must be keyboard navigable
- Form labels must be associated with inputs
- Error messages must be linked to form fields
- Focus states must be visible (2px outline minimum)
- Semantic HTML (proper heading hierarchy, etc.)

## Performance Standards
- Lighthouse score target: >90
- Bundle size target: <150KB gzipped
- Images must be lazy-loaded and optimized
- Code splitting for routes
- No unused dependencies

## API Integration
- All API calls through typed service layer
- Proper error handling and user feedback
- Loading states for async operations
- Token refresh handling in interceptors
- No hardcoded API endpoints

## Testing Requirements
- Unit tests for all logic-heavy components
- Snapshot tests for presentational components
- Integration tests for critical user flows
- Test coverage target: >70%
- Use React Testing Library (not Enzyme)

## Code Organization
- Feature-based folder structure
- Atomic design pattern for components
- Clear separation: pages, components, services, hooks, utils
- Shared components in common/components
- Constants and config in dedicated files

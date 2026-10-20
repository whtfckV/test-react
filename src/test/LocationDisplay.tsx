import { useLocation } from 'react-router'

export function LocationDisplay() {
  const { pathname } = useLocation()
  return <div data-testid="location">{pathname}</div>
}

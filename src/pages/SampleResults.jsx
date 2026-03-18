import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * SampleResultsPage: Development page with hardcoded sample data for designing p5.js and dataviz components.
 * Mimics the Results page but with fixed data so you can iterate on design without going through the quiz.
 */
export default function SampleResultsPage() {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/results?dims=djE6c3RyYXRlZ3k6NDYsYWRhcHRhYmlsaXR5OjM5LGNvbGxhYm9yYXRpb246NDYsZXhwZXJpbWVudGF0aW9uOjMzLGltcGFjdDo0NA%3D%3D')
    }, [navigate])
}

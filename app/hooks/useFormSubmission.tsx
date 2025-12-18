import { useNavigation, useLocation } from 'react-router'

/**
 * Hook to determine form submission state
 * Encapsulates logic for detecting when a form is being submitted on the same page
 * vs when navigation is happening
 */
export const useFormSubmission = () => {
  const navigation = useNavigation()
  const { pathname } = useLocation()
  
  const isSubmitting = navigation.state === 'submitting'
  const isNavigatingAway = 
    navigation.state === 'loading' && 
    navigation.location?.pathname && 
    navigation.location.pathname !== pathname
  
  // Form is submitting if:
  // 1. Currently submitting, OR
  // 2. Loading but staying on same page (loader re-run after form submission)
  const isFormSubmitting = isSubmitting || 
    (navigation.state === 'loading' && !isNavigatingAway)
  
  return {
    isSubmitting,
    isFormSubmitting,
    isNavigatingAway,
    navigationState: navigation.state,
  }
}


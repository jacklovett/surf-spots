import { TripForm } from './TripForm'
import { Trip } from '~/types/trip'
import { validateEmail } from '~/hooks/useFormValidation'
import { addMember } from '~/services/trip'

export interface LoaderData {
  trip?: Trip
  error?: string
}

export interface MemberEmailResult {
  memberEmails: string[]
  emailErrors: string[]
}

/**
 * Extracts and validates member emails from form data
 */
export const extractAndValidateMemberEmails = (
  formData: FormData,
): MemberEmailResult => {
  const memberEmails: string[] = []
  const emailErrors: string[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('memberEmail_') && value) {
      const email = (value as string).trim()
      // Only process non-empty emails
      if (email) {
        const error = validateEmail(email, 'Email')
        if (error) {
          emailErrors.push(error)
        } else {
          memberEmails.push(email)
        }
      }
    }
  }

  return { memberEmails, emailErrors }
}

export interface AddMembersResult {
  failedEmails: string[]
  alreadyInvitedEmails: string[]
}

/**
 * Adds members to a trip with error handling
 */
export const addMembersToTrip = async (
  tripId: string,
  userId: string,
  memberEmails: string[],
  cookie: string,
  options?: {
    throwOnFailure?: boolean
    handleAlreadyInvited?: boolean
  },
): Promise<AddMembersResult> => {
  const { throwOnFailure = false, handleAlreadyInvited = true } = options || {}
  const failedEmails: string[] = []
  const alreadyInvitedEmails: string[] = []

  for (const email of memberEmails) {
    try {
      await addMember(
        tripId,
        userId,
        { email },
        {
          headers: { Cookie: cookie },
        },
      )
    } catch (error) {
      // Check if it's an "already invited" error (400 status)
      const errorObj = error as { status?: number; message?: string }
      if (
        handleAlreadyInvited &&
        errorObj?.status === 400 &&
        errorObj?.message
          ?.toLowerCase()
          .includes('invitation has already been sent')
      ) {
        // This is fine - member is already invited, just track it
        alreadyInvitedEmails.push(email)
      } else {
        // Real error - track it
        console.error(`Failed to add member ${email}:`, error)
        failedEmails.push(email)
      }
    }
  }

  if (throwOnFailure && failedEmails.length > 0) {
    throw new Error(
      `Could not add members: ${failedEmails.join(', ')}. ${
        alreadyInvitedEmails.length > 0
          ? `Note: ${alreadyInvitedEmails.join(', ')} ${
              alreadyInvitedEmails.length === 1 ? 'was' : 'were'
            } already invited.`
          : ''
      }`,
    )
  }

  return { failedEmails, alreadyInvitedEmails }
}

export default TripForm

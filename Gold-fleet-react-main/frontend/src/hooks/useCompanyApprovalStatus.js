import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check company approval status and determine feature access.
 * 
 * Returns:
 * - isCompanyApproved: boolean - whether the company is fully approved
 * - isPendingApproval: boolean - whether company is waiting for approval
 * - canAccessRestrictedFeatures: boolean - whether user can access fleet management
 * - companyStatus: string - current company status
 * - subscriptionStatus: string - current subscription status
 */
export const useCompanyApprovalStatus = () => {
  const { company } = useAuth();

  const companyStatus = company?.company_status || null;
  const subscriptionStatus = company?.subscription_status || null;

  const isCompanyApproved = companyStatus === 'approved';
  const isPendingApproval = companyStatus === 'pending_approval';
  const canAccessRestrictedFeatures = isCompanyApproved && subscriptionStatus === 'active';

  return {
    isCompanyApproved,
    isPendingApproval,
    canAccessRestrictedFeatures,
    companyStatus,
    subscriptionStatus,
  };
};

export default useCompanyApprovalStatus;

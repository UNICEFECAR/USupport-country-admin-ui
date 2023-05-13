export const transformCampaignData = (campaign) => {
  const checkIsCampaignActive = (campaign) => {
    const now = new Date().getTime();
    const startDate = new Date(campaign.start_date).getTime();
    const endDate = new Date(campaign.end_date).getTime();

    return startDate >= now <= endDate && campaign.active;
  };
  const isActive = checkIsCampaignActive(campaign);
  return {
    couponCode: campaign.coupon_code,
    campaignId: campaign.campaign_id,
    name: campaign.name,
    budget: campaign.budget,
    numberOfCoupons: campaign.no_coupons,
    couponPrice: campaign.price_per_coupon,
    maxCouponsPerClient: campaign.max_coupons_per_client,
    startDate: new Date(campaign.start_date),
    endDate: new Date(campaign.end_date),
    termsAndConditions: campaign.terms_and_conditions,
    couponData: campaign.coupons,
    usedCoupons: campaign.coupons?.length || 0,
    usedBudget: (campaign.coupons?.length || 0) * campaign.price_per_coupon,
    active: isActive,
    status: isActive ? "active" : "inactive",
  };
};

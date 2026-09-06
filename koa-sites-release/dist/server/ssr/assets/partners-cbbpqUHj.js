//#region content/partners.ts
var partners = [];
function isPublicPartner(partner) {
	return partner.relationshipStatus === "verified" && partner.logoPermission === "approved" && partner.reviewStatus === "approved";
}
var publicPartners = partners.filter(isPublicPartner);
//#endregion
export { publicPartners as n, partners as t };



export const getPartnerinfo = (participants, email) => {

    const partnerInfo = participants.find(participant => participant.email !== email )

    return partnerInfo

}

export default getPartnerinfo
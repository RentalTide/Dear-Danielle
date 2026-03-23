const { getTrustedSdk, handleError } = require('../api-util/sdk');

/**
 * GET handler - Get collaborators for a listing.
 * Reads listing via trusted SDK to get privateData.collaborators.
 * Validates that the requesting user is the listing owner.
 */
const getCollaborators = (req, res) => {
  const { listingId } = req.params;

  if (!listingId) {
    return res.status(400).json({ error: 'Missing listingId parameter.' });
  }

  getTrustedSdk(req)
    .then(trustedSdk => {
      return trustedSdk.listings
        .show({ id: listingId, include: ['author'] })
        .then(listingResponse => {
          const listing = listingResponse.data.data;
          const authorId = listing.relationships?.author?.data?.id?.uuid;

          // Use the trusted SDK to verify the requesting user
          return trustedSdk.currentUser.show().then(userResponse => {
            const currentUserId = userResponse.data.data.id.uuid;

            if (currentUserId !== authorId) {
              return res
                .status(403)
                .json({ error: 'Only the listing owner can view collaborators.' });
            }

            // Fetch the listing via ownListings to access privateData
            return trustedSdk.ownListings
              .show({ id: listingId })
              .then(ownListingResponse => {
                const ownListing = ownListingResponse.data.data;
                const collaborators = ownListing.attributes.privateData?.collaborators || [];
                res.status(200).json({ data: collaborators });
              });
          });
        });
    })
    .catch(e => {
      handleError(res, e);
    });
};

/**
 * POST handler - Add a collaborator to a listing.
 * Accepts { listingId, userId } in body.
 * Reads current collaborators from listing privateData,
 * adds the new user ID if not already present,
 * and updates listing privateData via trusted SDK.
 */
const addCollaborator = (req, res) => {
  const { listingId, userId } = req.body || {};

  if (!listingId || !userId) {
    return res.status(400).json({ error: 'Missing listingId or userId in request body.' });
  }

  getTrustedSdk(req)
    .then(trustedSdk => {
      // Verify the requesting user is the listing owner
      return Promise.all([
        trustedSdk.ownListings.show({ id: listingId }),
        trustedSdk.currentUser.show(),
      ]).then(([ownListingResponse, userResponse]) => {
        const ownListing = ownListingResponse.data.data;
        const currentUserId = userResponse.data.data.id.uuid;
        const authorId = ownListing.relationships?.author?.data?.id?.uuid || currentUserId;

        if (currentUserId !== authorId) {
          return res
            .status(403)
            .json({ error: 'Only the listing owner can manage collaborators.' });
        }

        const currentCollaborators = ownListing.attributes.privateData?.collaborators || [];

        // Do not add duplicates
        if (currentCollaborators.includes(userId)) {
          return res.status(200).json({ data: currentCollaborators });
        }

        const updatedCollaborators = [...currentCollaborators, userId];

        return trustedSdk.ownListings
          .update({
            id: listingId,
            privateData: { collaborators: updatedCollaborators },
          })
          .then(() => {
            res.status(200).json({ data: updatedCollaborators });
          });
      });
    })
    .catch(e => {
      handleError(res, e);
    });
};

/**
 * DELETE handler - Remove a collaborator from a listing.
 * Accepts { listingId, userId } in body.
 * Removes user from collaborators array in privateData
 * and updates via trusted SDK.
 */
const removeCollaborator = (req, res) => {
  const { listingId, userId } = req.body || {};

  if (!listingId || !userId) {
    return res.status(400).json({ error: 'Missing listingId or userId in request body.' });
  }

  getTrustedSdk(req)
    .then(trustedSdk => {
      // Verify the requesting user is the listing owner
      return Promise.all([
        trustedSdk.ownListings.show({ id: listingId }),
        trustedSdk.currentUser.show(),
      ]).then(([ownListingResponse, userResponse]) => {
        const ownListing = ownListingResponse.data.data;
        const currentUserId = userResponse.data.data.id.uuid;
        const authorId = ownListing.relationships?.author?.data?.id?.uuid || currentUserId;

        if (currentUserId !== authorId) {
          return res
            .status(403)
            .json({ error: 'Only the listing owner can manage collaborators.' });
        }

        const currentCollaborators = ownListing.attributes.privateData?.collaborators || [];
        const updatedCollaborators = currentCollaborators.filter(id => id !== userId);

        return trustedSdk.ownListings
          .update({
            id: listingId,
            privateData: { collaborators: updatedCollaborators },
          })
          .then(() => {
            res.status(200).json({ data: updatedCollaborators });
          });
      });
    })
    .catch(e => {
      handleError(res, e);
    });
};

module.exports = { getCollaborators, addCollaborator, removeCollaborator };

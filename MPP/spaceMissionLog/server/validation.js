// server/validation.js
function validateMission(mission, isPartial = false) {
    let errors = {};
  
    // Validate Mission Name.
    if (!isPartial || mission.name !== undefined) {
      if (typeof mission.name !== 'string' || mission.name.trim().length < 3) {
        errors.name = 'Mission Name must be at least 3 characters long';
      } else if (!/^[\w\s\-,.!?]+$/.test(mission.name)) {
        errors.name = 'Mission Name contains invalid characters';
      }
    }
  
    // Validate Status.
    if (!isPartial || mission.status !== undefined) {
      if (!mission.status) {
        errors.status = 'Status is required';
      }
    }
  
    // Validate Mission Type.
    if (!isPartial || mission.type !== undefined) {
      if (!mission.type) {
        errors.type = 'Mission Type is required';
      }
    }
  
    // Validate Destination.
    if (!isPartial || mission.destination !== undefined) {
      if (!mission.destination) {
        errors.destination = 'Destination is required';
      }
    }
  
    // Validate Launch Date.
    if (!isPartial || mission.launchDate !== undefined) {
      if (!mission.launchDate) {
        errors.launchDate = 'Launch Date is required';
      } else if (isNaN(Date.parse(mission.launchDate))) {
        errors.launchDate = 'Launch Date must be a valid date';
      }
    }
  
    // Validate Budget.
    if (!isPartial || mission.budget !== undefined) {
      if (mission.budget === undefined || mission.budget === '') {
        errors.budget = 'Budget is required';
      } else if (isNaN(Number(mission.budget))) {
        errors.budget = 'Budget must be a valid number';
      } else if (Number(mission.budget) < 0) {
        errors.budget = 'Budget must be a positive number';
      }
    }
  
    // Validate Crew Members if provided.
    if (mission.crewMembers !== undefined && mission.crewMembers !== null) {
      if (!Array.isArray(mission.crewMembers)) {
        errors.crewMembers = 'Crew Members must be an array';
      } else {
        for (let member of mission.crewMembers) {
          if (typeof member !== 'string' || member.trim().length < 2) {
            errors.crewMembers = 'Each crew member name must be at least 2 characters long';
            break;
          }
          if (!/^[a-zA-Z\s\-']+$/.test(member)) {
            errors.crewMembers = 'Crew member names can only contain letters, spaces, hyphens, and apostrophes';
            break;
          }
        }
      }
    }
  
    return { valid: Object.keys(errors).length === 0, errors };
  }
  
  module.exports = { validateMission };
  
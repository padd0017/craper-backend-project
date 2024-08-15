const Crap = require("../models/crap");
const images = require("./image")
const { ObjectId } = require('mongodb');
const { NotFoundError, ForbiddenError, BadRequestError, UnauthorizedError } = require("../utils/error");
const debug = require("debug")("app:service")

const create = async(userId, input, files)=>{
  const image = await images.uploadMany(files);

  const newCrap = new Crap({
    ...input,
    images: image, 
    owner: userId,
    status: "AVAILABLE",
    location: {
      type: 'Point',
      coordinates: [input.long, input.lat],
    }
  });
    await newCrap.save();
    return newCrap;
}

const getAll = async (query) => {
debug({Query: query})
  let { keyword, distance, lat, long, show_taken } = query;
  const nearbyPlaces = await Crap.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [long, lat],
        },
        $maxDistance: distance,
      },
    },
  }).populate("owner","name").lean()

 let FilteredArray = []

nearbyPlaces.filter((item) => {
    debug({filtered:  item.status, item})
    if (show_taken === "true") {
    if(item.status !==  "FLUSHED") FilteredArray.push(item)
    } else {
   if(item.status === "AVAILABLE") FilteredArray.push(item)
    }
  });

  const finalData = FilteredArray.map((item)=>{
    const {location, buyer, suggestion, ...safeData} = item
    return safeData
  })

  debug({FilteredPlaces: finalData})
  if (keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // this will replace the special characters
    const regex = new RegExp(escapedKeyword, "i");
    keywordData= finalData.filter((item) => {
      return item.title.match(regex) || item.description.match(regex);
    });

    debug({dataKeyword: keywordData})
    return keywordData;
  }
  debug({noKeyword: finalData})

    return finalData

};

const getOne = async(Id, userId)=>{
        const crap = await  Crap.findById(Id).populate("owner", "name ").populate("buyer", "_id name");

        if (!crap) {
          throw new NotFoundError(`crap with id ${Id} not found`);
        }

        if(!crap.owner?._id.toString() == userId.toString() || !crap.buyer?._id.toString() == userId.toString()){
          crap.buyer = undefined
          crap.location = undefined
          crap.suggestion = undefined
        }
        return crap
}


const getMine = async(owner)=>{
  const crap  = await Crap.find({$or:[{ owner: new ObjectId(owner)},{ buyer: new ObjectId(owner)}]
   
  }).populate("owner", "name ").populate("buyer", "name, ");

  return crap;
}

const interested = async(userId, Id)=>{
  const crap = await Crap.findById(Id).populate("owner", "name").populate("buyer", "-googleId");


  if (!crap) {
    throw new NotFoundError(`crap with id ${Id} not found`);
  }

  if(crap.status !== "AVAILABLE"){
    throw new BadRequestError("crap is not available");
  }

  crap.status = "INTERESTED";
  crap.buyer = userId._id

 

  await crap.save()
  return crap;
}

const suggest = async(input, Id, userId)=>{
  const crap = await Crap.findById(Id);

  if(crap.status !== "INTERESTED"){
    throw new BadRequestError("No Buyer Showed Interest");
  }

  if (crap.owner._id.toString() !== userId.toString()) {
    throw new ForbiddenError(`unAuthenticated, you do not have the access`);
}

crap.status = "SCHEDULED";
crap.suggestion = input;

return await crap.save()
}


const sellerAgree = async(Id, userId)=>{
  const crap = await Crap.findById(Id);

  if(crap.status !== "SCHEDULED"){
    throw new BadRequestError("Crap is not Scheduled by the Seller Yet");
  }

  if (crap.owner._id.toString() !== userId.toString()) {
    throw new ForbiddenError(`unAuthenticated, you do not have the access`);
}

crap.status = "AGREED";
return await crap.save();
}

const sellerDisagree = async(Id, userId)=>{
  const crap = await Crap.findById(Id);

  if(crap.status !== "SCHEDULED"){
    throw new BadRequestError("Crap is not Scheduled by the Seller Yet");
  }

  if (crap.owner._id.toString() !== userId.toString()) {
    throw new ForbiddenError(`unAuthenticated, you do not have the access`);
}

crap.status = "INTERESTED";
crap.suggestion = null;
return await crap.save();
}

const resetCrap = async(Id, userId)=>{
  const crap = await Crap.findById(Id);

  if(crap.status === "FLUSHED"){
    throw new BadRequestError("Crap is Sold");
  }

  if (crap.owner._id.toString() !== userId.toString()) {
    throw new ForbiddenError(`unAuthenticated, you do not have the access`);
}

crap.status = "AVAILABLE";
crap.suggestion = undefined
crap.buyer= undefined 
return await crap.save();
}

const flusedCrap = async(Id, userId)=>{
  const crap = await Crap.findById(Id);

  if(crap.status !== "AGREED"){
    throw new BadRequestError("Buyer is not ready to take the crap");
  }

  if (crap.owner._id.toString() !== userId.toString()) {
    throw new ForbiddenError(`unAuthenticated, you do not have the access`);
}

crap.status = "FLUSHED";
return await crap.save();
}



const update = async({Id, body, userId, files})=>{
        const crap = await Crap.findById(Id);
        
        if (!crap) {
        throw new NotFoundError(`crap with id ${Id} not found`);
        }

        if(!crap._id) {
          throw new UnauthorizedError("this is not urs")
        }

        if (crap.owner._id.toString() !== userId._id.toString()) {
            throw new ForbiddenError(`unAuthenticated, you do not have the access`);
        }


          Object.assign(crap, body);

          if(files> 0 || files) {
            const image = await images.uploadMany(files);
            crap.images = image
          }
          crap.owner =  { 
            _id: new ObjectId(userId._id),
            name: userId.name
          },
        await crap.save();
        return crap;
}

const replace = async({Id, body, owner, files})=>{
  
  const crap = await Crap.findById(Id)
        if (!crap) {
        throw new NotFoundError(`crap with id ${Id} not found`);
        }

        if(!crap.owner) {
          throw new UnauthorizedError("this is not urs")
        }

        if (crap.owner._id.toString() !== owner.toString()) {
            throw new ForbiddenError(`unAuthenticated, you do not have the access`);
        }
          crap.overwrite(body);
          crap.location = {
            type: 'Point',
            coordinates: [body.lat, body.long],
          }
          const image = await images.uploadMany(files);
          crap.images = image
          crap.status = "AVAILABLE"
          crap.owner =  owner.toString()
        await crap.save();
        return crap;
}

const deleteOne = async(Id, owner)=>{
const crap = await Crap.findById(Id);

if (!crap) {
    throw new NotFoundError(`Crap with id ${Id} not found`);
    }

    if (crap.owner._id.toString() !== owner.toString()) {
        throw new ForbiddenError(`Not your Crap yet`);
    }

    await crap.deleteOne({ _id: new ObjectId(Id) });
  return crap;
}


module.exports = {
    create, 
    getAll,
    getOne,
    replace,
    update,
    deleteOne,
    getMine,
    interested,
    suggest,
    sellerAgree,
    sellerDisagree,
    resetCrap,
    flusedCrap
}





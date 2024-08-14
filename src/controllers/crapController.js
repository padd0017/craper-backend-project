const crapServices = require("../services/crapService");
const requestHandler = require("../utils/requestHandler");
const {uploaMany} = require("../services/image");
const crap = require("../models/crap");
const debug = require("debug")("app:crapcontrol");

const create = requestHandler(async(req, res)=>{
    const newCrap = await crapServices.create(req.user._id, req.sanitizedBody, req.files);

    res.status(201).json({
        data: newCrap
    })
}
)

const getAll = requestHandler(async(req, res)=>{
    const crap =await crapServices.getAll(req.query)
    res.status(200).json({ data: crap });
    }
    )


    const getOne = requestHandler(async(req, res)=>{
        const crap = await crapServices.getOne(req.params.id, req.user._id);
        console.log(crap)
        res.status(200).json({data: crap})
        }
        )

    const getMine = requestHandler(async(req, res)=>{
        
        const crap = await crapServices.getMine(req.user._id);
        res.status(200).json({data: crap})
        }
        )
        
    const interested = requestHandler(async(req, res)=>{
        const crap = await crapServices.interested(req.user, req.params.id);
        res.status(200).json({data: crap})
        }
        )

        const suggest = requestHandler(async(req, res)=>{
            const crap = await crapServices.suggest(req.body, req.params.id, req.user._id);
            res.status(200).json({data: crap})
        }
        )

        const agree = requestHandler(async(req, res)=>{
            const crap = await crapServices.sellerAgree(req.params.id, req.user._id)
            res.status(201).json({data: crap})
        }
        )

        const disagree = requestHandler(async(req, res)=>{
            const crap = await crapServices.sellerDisagree(req.params.id, req.user._id)
            res.status(201).json({data: crap})
        }
        )

        const reset = requestHandler(async(req, res)=>{
            const crap = await crapServices.resetCrap(req.params.id, req.user._id)
            res.status(200).json({data: crap})
        }
        )

        const flushed = requestHandler(async(req, res)=>{
            const crap = await crapServices.flusedCrap(req.params.id, req.user._id)
            res.status(200).json({data: crap})
        }
        )

    const update = requestHandler(async(req, res)=>{
        let crapData = { Id:req.params.id, body:req.body, userId:req.user}

        debug(req.user)

        if(req.files > 0 || req.files) {
            crapData = { Id:req.params.id, body:req.body, userId:req.user, files: req.files}
        }

        const crap = await crapServices.update(crapData);
        res.status(200).json({ data: crap })
        }
        )

    const replace = requestHandler(async(req, res)=>{
        let crapData = { Id:req.params.id, body:req.body, owner:req.user._id, files: req.files}

        

        const crap = await crapServices.replace(crapData);
        res.status(200).json({ data: crap })
        }
        )
        
        
    const deleteOne = requestHandler(async(req, res)=>{
        const crap  = await crapServices.deleteOne(req.params.id, req.user._id)
        res.status(200).json({
            data: crap,
        });
        }
        )
        
        module.exports = {
            create,
            getAll,
            getOne,
            update,
            replace,
            deleteOne,
            getMine,
            interested,
            suggest,
            agree,
            disagree,
            reset,
            flushed
        }

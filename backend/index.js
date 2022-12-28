import express from "express";
import cors from 'cors';
import * as dotenv from 'dotenv';
import { MongoClient, ObjectId } from "mongodb";
import morgan from "morgan";
import multer from "multer";
import fs from 'fs';
import path from "path";
dotenv.config()

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('ecommerce');
const cats = db.collection('categories');
const prods = db.collection('products');
const upload = multer({ dest: './temp' });


app.get('/', async (req, res, next) => {
    console.log(req.params);
    console.log(req.body);

    await cats.countDocuments()
        .then(async count => {
            if (count > 0) {
                const catList = cats.find();
                var catObj = [];
                await catList.forEach(cat => {
                    let len = catObj.push(cat);
                    console.log(cat);
                    console.log(len);
                });
                console.log("Catlist:" + catObj.length);
                console.log(catObj);
                res.status(200).send(catObj);
            } else {
                console.log("No items found");
                res.status(400).send([]);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).send([]);
        })

    // res.status(200).send("Root get");
});

app.post('/newCategory', async (req, res, next) => {
    console.log(req.params);
    console.log(req.body);

    var level = 0;
    level = req.body.level;

    var level = 0;
    var topName = "";

    level = req.body.level;
    topName = req.body.topName;




    try {
        var catCursor = cats.find({ "name": topName, "level": level });

        catCursor.forEach(cat => { console.log(cat._id) });
    } catch (error) {
        console.error(error);
    }

    res.status(201).send("Add data");
});

app.get('/getCats', async (req, res) => {
    console.log(req.body);
    console.log(req.query);
    var catArray = [];
    if (req.query.level && req.query.id) {

        const level = Number(req.query.level);
        const id = req.query.id;
        const filter = { "level": level + 1 };
        const parentFilter = { "_id": new ObjectId(id) };

        const numDocs = await cats.countDocuments(filter);
        const numParentDocs = await cats.countDocuments(parentFilter);

        if (numParentDocs > 0) {
            const categories = cats.find(filter);
            const parentCat = await cats.findOne(parentFilter);
            const parentName = parentCat.name;

            console.log(`Parent name: `);
            console.log(parentCat);

            await categories.forEach(cat => {
                console.log(cat);
                if (id === cat.parent) {
                    catArray.push(cat);
                    console.log(`Pushed ${cat._id} to array`);
                } else {
                    console.log(`${id} != ${cat._id}`);
                }

            });
            console.log("Catarray:");
            console.log(catArray);
            var data = [];
            data.push(parentCat);
            data.push(catArray);
            res.status(200).send(data);
        } else {
            res.status(200).send(data);
        }

        // console.log(`Found ${numDocs} documents`);
    }

    // res.status(200).send("Category list");
});

app.get('/getBaseCats', async (req, res) => {
    console.log(req.query);
    console.log(req.body);
    const level = req.query.level;
    const filter = { "level": 0 }

    const docCount = await cats.countDocuments(filter);

    if (docCount > 0) {
        var catArray = [];
        const baseCats = cats.find(filter);
        await baseCats.forEach(baseCat => {
            catArray.push(baseCat);
        });

        res.status(200).send(catArray);
    } else {
        res.status(400).send("No records for the given filter");
    }

    // res.status(200).send("baseCats");
});



app.post('/newCat', async (req, res) => {
    console.log(req.query);
    console.log(req.body);

    const filter = { "_id": new ObjectId(req.body.parentId) }

    console.log("Using filter:");
    console.log(filter);

    const docCount = await cats.countDocuments(filter);

    if (docCount == 1) {
        const parentCat = await cats.findOne(filter);
        const parentId = req.body.parentId;
        const newCatLevel = Number(parentCat.level) + 1;
        const newCat = {
            "name": req.body.newName,
            "level": newCatLevel,
            "parent": parentId
        }
        cats.insertOne(newCat)
            .then(created => {
                console.log(created.insertedId);
                res.status(200).send(created.insertedId);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            })
    } else if (req.body.parentId == null) {
        // Create base catefory id no parent
        const newCat = {
            "name": req.body.newName,
            "level": 0,
            "parent": null
        }
        cats.insertOne(newCat)
            .then(created => {
                console.log(created.insertedId);
                res.status(200).send(created.insertedId);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            })
    } else {

        res.status(400).send(`Invalid num of records found: ${docCount}`);
    }

    // res.status(200).send(`Doc count : ${docCount}`);
});

app.post('/deleteCat', async (req, res) => {
    console.log(req.body);
    console.log(req.params);
    console.log(req.query);

    if (req.body.id) {
        var idArray = [];
        idArray.push(req.body.id);
        await deleteCat(idArray)
            .then(del => {
                console.log(`Total deleted: ${del}`);
                res.status(200).send(`${del}`);
            })
            .catch(err => {
                console.log(`Error: ${err}`);
                res.status(500).send(`${err}`);
            });

    } else {
        res.status(400).send("No id given");
    }

});

app.get('/getAllCats', async (req, res) => {
    await getAllCats()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            console.log("Error getting all cats");
            res.status(500).send("Error reading all cats");
        })
});

app.post('/newProd', upload.single('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.params);
    console.log(req.file.originalname);

    const prodName = req.body.prodName;
    const prodPrice = req.body.prodPrice;
    const prodCats = req.body.prodCats;
    const fileExt = req.file.originalname.split('.').slice(-1)[0];
    const target = `./public/images/${prodName}.${fileExt}`;


    console.log(fileExt);
    if (fileExt === 'jpg') {
        console.log("Renaming...");
        fs.rename(req.file.path, target, err => {
            if (err) {
                console.log("Error renaming");
                console.error(err);
            }

        });

        const newProd = {
            'prodName': prodName,
            'prodPrice': prodPrice,
            'prodCats': JSON.parse(prodCats),
            'prodImage': target
        }

        console.log("Prodcats:");
        console.table(JSON.parse(prodCats));

        await prods.insertOne(newProd)
            .then(inserted => {
                console.log(`Inserted ${inserted.insertedId}`);
                res.status(200).send(inserted.insertedId);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    } else {
        res.status(400).send("Wrong file type.");
    }

});

app.get('/getAllProds', async (req, res) => {
    const prodCursor = prods.find();
    var prodArray = [];

    await prodCursor.forEach(prod => {
        prodArray.push(prod);
    });

    res.status(200).send(prodArray);
});

app.get('/getProd', async (req, res) => {


    const filter = { "_id": ObjectId(req.query.id) };
    console.log(req.query);
    await prods.countDocuments(filter).then(count => {
        console.log(`Found ${count} docs`);
    });

    await prods.findOne(filter)
        .then(prod => {
            res.status(200).send(prod);
        })
        .catch(err => {
            console.log("Error getting prod " + req.query.id);
            console.error(err);
            res.status(500).send(err);
        })
})

app.post('/deleteProd', async (req, res) => {
    console.log(req.body);

    const prodId = req.body.delId;
    const delFilter = { "_id": new ObjectId(prodId) };

    const countDocs = await prods.countDocuments(delFilter);
    var delProd;
    if (countDocs > 0) {
        await prods.findOne(delFilter)
            .then(prod => {
                delProd = prod;
            })
            .catch(err => {
                console.log("Error finding del prod");
                console.error(err);
                res.status(500).send(err);
            });

        await prods.deleteOne(delFilter)
            .then(deleted => {
                console.log(`Deleted ${deleted.deletedCount}`);

                fs.unlink(delProd.prodImage, err => {
                    if (err) {
                        console.log("Error deleting prod image");
                        console.error(err);
                        res.status(500).send(err);
                    } else {
                        res.status(200).send(`${deleted.deletedCount}`);
                    }
                });

            })
            .catch(err => {
                console.log("Error deleting product:");
                console.error(err);
                res.status(500).send(err);
            })
    }
});

app.post('/editProd', upload.single('file'), async (req, res) => {
    console.log(req.body.editId);
    console.log(req.body.prod);
    const id = req.body.editId;
    const editFilter = { "_id": ObjectId(req.body.editId) };
    const newName = req.body.prodName;
    const newPrice = req.body.prodPrice;
    const newCats=JSON.parse(req.body.prodCats);
    var newImage;
    // const newImagePath=req.file.path;


    var currentProd;
    await prods.countDocuments(editFilter)
        .then(async count => {
            if (count > 0) {
                await prods.findOne(editFilter)
                    .then(current => {
                        currentProd = current;
                    })
                    .catch(err => {
                        console.log("Error getting prod data");
                        res.status(500).send(err);
                    })
            }
        })
        .catch(err => {
            console.log("Error counting docs");
            res.status(500).send(err);
        });

    if ((!req.file) || req.file == 'undefined') {
        console.log(`Renaming ./public/images/${currentProd.prodName}.jpg to ./public/images/${newName}.jpg`);
        fs.rename(`./public/images/${currentProd.prodName}.jpg`, `./public/images/${newName}.jpg`, err => {
            if (err) {
                console.error(err);
            }else{
                newImage=`./public/images/${newName}.jpg`
            }
        });
    }else{
        fs.unlink(`./public/images/${currentProd.prodName}.jpg`,err=>{
            if(err){
                console.error(err);
                res.status(500).send(err);
            }else{
                fs.rename(req.file.path,`./public/images/${newName}.jpg`,err=>{
                    if(err){
                        console.log("Error copying new image");
                        console.error(err);
                        res.status(500).send(err);
                    }else{
                        newImage=`./public/images/${newName}.jpg`;
                    }
                })
            }
        })
    };
    const newDoc = {
        "prodName": newName,
        "prodPrice":newPrice,
        "prodCats":newCats,
    };

    if(newImage && newImage!='undefined'){
        newDoc['prodImage']=newImage;
    };

    await prods.updateOne(editFilter,{$set:newDoc})
    .then(edited=>{
        res.status(200).send(`${edited.modifiedCount}`);
    })
    .catch(err=>{
        res.status(500).send(err);
    });

});

app.get('/images', (req, res) => {
    console.log(req.query.prod);
    // console.log(process.cwd().replace('\\',g,'/'));

    res.status(200).sendFile(path.join(process.cwd(), `./public/images/${req.query.prod}.jpg`));
})


const getAllCats = async () => {
    const allCats = cats.find();
    var catArray = [];

    await allCats.forEach(cat => {
        catArray.push(cat);
    });

    return catArray;
}


// var delCount = 0;
const deleteCat = async (idArray) => {

    var done = false;
    var delCount = 0;
    var error = false;
    var errorText = "";

    await idArray.forEach(async id => {
        const deleteFilter = { "_id": new ObjectId(id) };
        const childFilter = { "parent": id };

        await cats.deleteMany(deleteFilter)
            .then(async deleted => {

                delCount += deleted.deletedCount;
                console.log("Deleted: " + deleted.deletedCount);

                if (await cats.countDocuments(childFilter) > 0) {
                    var childArray = [];
                    const children = cats.find(childFilter);
                    await children.forEach(child => {
                        console.table(child);
                        childArray.push(child._id.toString());
                    });
                    console.log("Recusrsively calling with array:");
                    console.log(childArray);
                    await deleteCat(childArray)
                        .then(count => {
                            delCount += count;
                            console.log(`count: ${count}`);
                        });
                } else {
                    console.log("Done deleting");
                    done = true;
                    // res.status(200).send(`${deleted.deletedCount}`);
                    // return new Promise((resolve, reject) => {
                    //     if (!error) {
                    //         resolve(delCount)
                    //     } else {
                    //         reject(errorText);
                    //     }
                    // });
                }
            })
            .catch(err => {
                console.error(err);
                error = true;
                errorText = err;
                // res.status(500).send(err);
                // return new Promise((resolve, reject) => reject(err));
            });
    });
    // if(done){
    return delCount;
    // }

};





app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
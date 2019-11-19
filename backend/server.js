
const express = require('express');
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
//const cors = require('cors');
//const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
//const Issue = require('./models/Issue');
import Issue from './models/Issue';


const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/issues');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

// configure and implement the various endpoints of the server we can now make use of Router’s route method
router.route('/issues').get((req, res) => {
    Issue.find((err, issues) => {
        if (err)
            console.log(err);
        else
            res.json(issues);
    });
});

/**The next route which is added is /issues/:id. This route is used to send a 
 * HTTP GET request to retrieve a single issue from the database in JSON format. 
 * Part of that route is the id parameter. This parameter is used to specify which 
 * issue entry should be returned. */
router.route('/issues/:id').get((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (err)
            console.log(err);
        else
            res.json(issue);
    })
});

/**The route which is used to add new issues via an HTTP post request is /issues/add. 
 * With the data submitted in the request body (available via req.body) we’re creating 
 * a new Issue object. The save method from the model class is then used to store this 
 * new Issue object in the database
 */
router.route('/issues/add').post((req, res) => {
    let issue = new Issue(req.body);
    issue.save()
        .then(issue => {
            res.status(200).json({'issue': 'Added successfully'});
        })
        .catch(err => {
            res.status(400).send('Failed to create new record');
        });
});

/**The code which needs to added to update existing issues by sending an HTTP Post request 
 * to route /issues/update/:id can be seen in the following listing 
 * */
router.route('/issues/update/:id').post((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return next(new Error('Could not load Document'));
        else {
            issue.title = req.body.title;
            issue.responsible = req.body.responsible;
            issue.description = req.body.description;
            issue.severity = req.body.severity;
            issue.status = req.body.status;

            issue.save().then(issue => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

/**Next, let’s add the route /issues/delete/:id to delete an existing issue entry from the database
 */
router.route('/issues/delete/:id').get((req, res) => {
    Issue.findByIdAndRemove({_id: req.params.id}, (err, issue) => {
        if (err)
            res.json(err);
        else
            res.json('Removed successfully');
    });
});

app.use('/', router);

app.listen(4000, () => console.log(`Express server running on port 4000`));
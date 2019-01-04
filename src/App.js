import React, {Component} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import 'react-day-picker/lib/style.css';
import './App.css';

let moment = require('moment-timezone');

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            categories: {
                'projects': {
                    'react scheduler': {
                        deadline: '',
                        progress: 10,
                        priority: '',
                        key:1
                    },
                    'something idk': {
                        deadline: '',
                        progress: 5,
                        priority: '',
                        key:2
                    }
                },

                'schoolwork': {}
            },
            potentialCategory: '',
            potentialTask: '',
            timezone:'America/New_York',
            keyCount:3,
            timezoneMapping: {'America/Chicago':'Central','America/Denver':'Mountain','America/Los_Angeles':'Pacific',
                'America/New_York':'Eastern'}
        }
        this.trackCategoryInput = this.trackCategoryInput.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.cloneObject = this.cloneObject.bind(this);
        this.addTask = this.addTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.trackTaskInput = this.trackTaskInput.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.timezoneListener = this.timezoneListener.bind(this);


    }

    // cloneObject(obj) {
    //     let clone = {};
    //     for (let i in obj) {
    //         if (obj[i] != null && typeof (obj[i]) == "object" && !(obj[i].constructor.name == 'Date' || obj[i].constructor.name == 'Moment'))
    //             clone[i] = this.cloneObject(obj[i]);
    //         else if (obj[i].constructor.name == 'Date') {
    //             clone[i] = new Date(obj[i].getTime())
    //         } else if (obj[i].constructor.name == 'Moment') {
    //             clone[i] = obj[i].clone()
    //         } else
    //             clone[i] = obj[i];
    //     }
    //     return clone;
    // }

    cloneObject(obj) {
        let clone = {};
        for (let i in obj) {
            if (obj[i] != null && typeof (obj[i]) == "object")
                clone[i] = this.cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
    }

    trackCategoryInput(e) {
        this.setState({potentialCategory: e.target.value})
    }

    addCategory() {
        if (this.state.potentialCategory.length > 0) {
            let copiedState = this.cloneObject(this.state);


            copiedState.categories[copiedState.potentialCategory] = {};

            this.setState(state => ({
                categories: copiedState.categories
            }))
            this.setState({potentialCategory: ''})
        } else {
            alert("you need to give the category a name")
        }


    }

    addTask(e) {
        let potentialTask = this.state.potentialTask;
        if (potentialTask.length < 1) {
            alert("you need to name your task")
            return
        }
        this.setState(state => ({
            keyCount: state.keyCount + 1
        }))

        let categoryToAddTo = e.target.value
        let copiedState = this.cloneObject(this.state);
        copiedState.categories[categoryToAddTo][potentialTask] = {
            hasDeadline: false,
            hasDeadlineHour: false,
            deadline: '',
            progress: 0,
            priority: '',
            deadlineHour: '',
            key:this.state.keyCount
        };
        this.setState(state => ({
            categories: copiedState.categories
        }))


    }

    trackTaskInput(e) {
        this.setState({potentialTask: e.target.value})
    }

    deleteTask(nameAndCategory) {
        let category = nameAndCategory.category;
        let taskName = nameAndCategory.name;

        let copiedCategories = this.cloneObject(this.state.categories);
        delete copiedCategories[category][taskName];

        this.setState(state => ({
            categories: copiedCategories
        }))

    }

    deleteCategory(e) {
        let categoryName = e.target.value;
        let copiedCategories = this.cloneObject(this.state.categories);
        delete copiedCategories[categoryName];

        this.setState(state => ({
            categories: copiedCategories
        }))

    }

    updateItem(itemState) {
        let copiedCategories = this.cloneObject(this.state.categories);
        let itemName = itemState.name
        let itemCategory = itemState.category;
        let newDeadline = itemState.deadline;
        let newProgress = itemState.progress;
        let newDeadlineHour = itemState.deadlineHour;
        let hasDeadline = itemState.hasDeadline;
        let hasDeadlineHour = itemState.hasDeadlineHour;
        let key = itemState.id;


        copiedCategories[itemCategory][itemName] = {
            hasDeadline: hasDeadline,
            hasDeadlineHour: hasDeadlineHour,
            deadline: newDeadline,
            progress: newProgress,
            priority: 'NA',
            deadlineHour: newDeadlineHour,
            key:key
        }

        this.setState(state => ({
            categories: copiedCategories
        }))
    }


    timezoneListener(event) {
        let timezoneval = event.target.value
        this.setState(state => ({timezone: timezoneval}));

    }


    render() {
        return (
            <div className='main'>
                <div className="jumbotron text main"><p className="jumbo-text"> Make a Schedule!</p>
                    <div className='jumbo-line'> </div>
                    <br></br><br></br>
                    <label>

                        Pick your timezone: <select value={this.state.value} onChange={this.timezoneListener}>
                            <option value='America/New_York'> Eastern</option>
                            <option value='America/Chicago'> Central</option>
                            <option value='America/Denver'> Mountain</option>
                            <option value='America/Los_Angeles'>Pacific</option>
                        </select>
                    </label>
                    <p style={{margin:0}}><i>Times are currently based on {this.state.timezoneMapping[this.state.timezone]} time where it is {moment.tz(this.state.timezone).format("hh:mm A")}</i></p>
                    <p className={'smalltext'}> <b>If this is not your timezone, change it above or the deadlines and time left for your deadlines will be incorrect </b></p>

                </div>


                <div className="align text">
                    <h2>Add to your schedule</h2>
                    <input onChange={this.trackCategoryInput} value={this.state.potentialCategory}
                           placeholder="add a category" type="text"/>
                    <button onClick={this.addCategory} className="btn btn-success"> Add Category</button>


                    <hr></hr>
                    <br></br>
                    <br></br>

                </div>
                <CategoryList trackTask={this.trackTaskInput}
                              deleteTaskFunc={this.deleteTask}
                              categories={this.state.categories}
                              addTaskFunc={this.addTask}
                              deleteCategoryFunc={this.deleteCategory}
                              updateItemFunc={this.updateItem}
                              timezone={this.state.timezone}

                />
            </div>
        )
    }
}


class CategoryList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="align">
                {Object.keys(this.props.categories).map((key) =>
                    <div className="category text">
                        <Category deleteCategoryFunc={this.props.deleteCategoryFunc}
                                  addTaskFunc={this.props.addTaskFunc}
                                  trackTask={this.props.trackTask} categoryName={key}
                                  deleteTaskFunc={this.props.deleteTaskFunc}
                                  items={this.props.categories[key]}
                                  updateItemFunc={this.props.updateItemFunc}
                                  timezone={this.props.timezone}
                        />
                    </div>)}
            </div>)
    }

}

class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true
        }

        this.collapseOrExpand = this.collapseOrExpand.bind(this);
    }

    collapseOrExpand() {
        if (this.state.collapsed) {
            this.setState({collapsed: false})
        } else {
            this.setState({collapsed: true})
        }
    }

    //why cant i assign the differenc in renders to a variable and then stick that variable in the body??
    render() {
        if (!this.state.collapsed) {
            return (
                <div className="align">
                    <h1> {this.props.categoryName}
                        <button value={this.props.categoryName} onClick={this.props.deleteCategoryFunc}
                                className="btn btn-danger btn-sm">Delete
                        </button>
                        <button onClick={this.collapseOrExpand} className="btn btn-warning btn-sm"> Collapse</button>
                    </h1>
                    <input onChange={this.props.trackTask} placeholder="task name"/>
                    <button className="btn btn-success btn-sm" value={this.props.categoryName}
                            onClick={this.props.addTaskFunc}> add task
                    </button>
                    <br></br><br></br>
                    <ItemList category={this.props.categoryName}
                              deleteTaskFunc={this.props.deleteTaskFunc}
                              items={this.props.items}
                              updateItemFunc={this.props.updateItemFunc}
                              timezone={this.props.timezone}
                              collapsed = {this.state.collapsed}  />
                </div>
            )
        } else {
            return (
                <div className='align'>
                    <h1>
                        {this.props.categoryName}
                        <span></span>
                        <button value={this.props.categoryName} onClick={this.props.deleteCategoryFunc}
                                className="btn btn-danger btn-sm">Delete
                        </button>
                        <button onClick={this.collapseOrExpand} className="btn btn-warning btn-sm"> Expand</button>
                    </h1>
                    <p><i>{Object.keys(this.props.items).length} items hidden</i></p>
                </div>
            )
        }
    }
}


class ItemList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className='align'>
                {Object.keys(this.props.items).map((key) =>
                    <div className='align'>
                        <Item category={this.props.category}
                              deleteTaskFunc={this.props.deleteTaskFunc}
                              taskName={key}
                              task={this.props.items[key]}
                              updateItemFunc={this.props.updateItemFunc}
                              timezone={this.props.timezone}
                              collapsed = {this.props.collapsed}
                              key = {this.props.items[key].key}
                              id = {this.props.items[key].key}
                        />
                    </div>)}
            </div>
        )
    }
}

const format = 'h:mm a';


class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.taskName,
            category: this.props.category,
            inEditingMode: false,
            hasDeadline: this.props.task.hasDeadline,
            hasDeadlineHour: this.props.task.hasDeadlineHour,
            deadline: this.props.task.deadline,
            progress: this.props.task.progress,
            deadlineHour: this.props.task.deadlineHour,
            timezone: this.props.timezone,
            timer: moment().format(),
            id:this.props.id
            }




        this.toggleEdit = this.toggleEdit.bind(this);
        this.trackDeadline = this.trackDeadline.bind(this);
        this.trackProgress = this.trackProgress.bind(this);
        this.trackDeadlineHour = this.trackDeadlineHour.bind(this);
        this.combineDate = this.combineDate.bind(this);
    }


    toggleEdit(pushChanges) {
        if (this.state.inEditingMode && this.state.hasDeadline && this.state.hasDeadlineHour) {
            this.setState({inEditingMode: false})
        } else if (this.state.inEditingMode && (!this.state.hasDeadline || !this.state.hasDeadlineHour)) {
            alert("you have to enter both a deadline date and deadline hour!")
        } else {
            this.setState({inEditingMode: true})
        }
        if (pushChanges) {
            this.props.updateItemFunc(this.state)
        }


    }

    trackDeadline(day) {
        this.setState({deadline: day.toString()})
        this.setState({hasDeadline: true})
    }

    trackProgress(e) {
        let newProgress = e.target.value;
        this.setState({progress: newProgress})
    }

    trackDeadlineHour(hour) {
        this.setState({deadlineHour: hour.toString()})
        this.setState({hasDeadlineHour: true})
    }

    combineDate(dateObj, hoursObj) {
        let combinedDate = new Date(dateObj.toLocaleDateString())
        combinedDate.setHours(hoursObj.hours())
        combinedDate.setMinutes(hoursObj.minutes())
        let newDeadlineDate = moment(combinedDate);
        return newDeadlineDate
    }

    render() {
        let deadline = ''
        let timeLeft = ''
        let deadlineHourPlaceHolder = 'pick an hour'
        let deadlineDatePlaceholder = 'pick a date'


        //if the user has entered a date and a time for the task
        if (this.state.hasDeadline && this.state.hasDeadlineHour) {
            deadline = new Date(this.state.deadline).toLocaleDateString() + ' ' + moment(this.state.deadlineHour).format(format)
            deadlineDatePlaceholder = new Date(this.state.deadline).toLocaleDateString()
            deadlineHourPlaceHolder = moment(this.state.deadlineHour).format(format)

            let currentTime = moment.tz(this.props.timezone)
            let fullDeadlineDate = this.combineDate(new Date(this.state.deadline), moment(this.state.deadlineHour)).tz(this.props.timezone)

            timeLeft = <TimeLeftTimer
                timezone = {this.props.timezone}
                deadlineDate = {fullDeadlineDate}
            />

            if (fullDeadlineDate.isBefore(currentTime)) {
                timeLeft = <b style={{color: 'red'}}>deadline passed!</b>
                //if the deadline is after current time, set up the timer to display time left.

            }

            //user has not entered in a date or time.
        } else {
            deadline = <b>edit and set a deadline </b>
            timeLeft = <b>this task needs a deadline </b>
        }


        if (!this.state.inEditingMode) {
            return (
                <div className="itembox">
                    <div className="itemboxheader">
                        <h3 style={{margin:0}}> <b>{this.props.taskName}</b></h3>
                        <button className="btn btn-success btn-xs" onClick={() => this.toggleEdit(false)}> Edit </button>
                        <button
                            onClick={() => this.props.deleteTaskFunc({
                            category: this.props.category,
                            name: this.props.taskName
                        })}
                            className="btn btn-danger btn-xs"> Delete
                        </button>
                    </div>

                    <ul>
                        <li> deadline:{deadline}</li>
                        {/*<li> current time: {moment.tz(this.props.timezone).hours()}  </li>*/}
                        <li> time left: {timeLeft} </li>
                        <li>
                            progress:
                            <div className="progress">
                                <div className="progress-bar" role="progressbar" aria-valuenow="70"
                                     aria-valuemin="0" aria-valuemax="100" style={{width: this.state.progress + '%'}}>
                                    {this.state.progress}%
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        } else {

            return (
                <div className="align itembox">
                    <h5> {this.props.taskName} </h5>
                    <ul>
                        <li> deadline: <DayPickerInput placeholder={deadlineDatePlaceholder}
                                                       onDayChange={day => this.trackDeadline(day)}/>
                            <TimePicker
                                showSecond={false}
                                placeholder={deadlineHourPlaceHolder}
                                className="xxx"
                                onChange={(value) => this.trackDeadlineHour(value)}
                                format={format}
                                use12Hours
                                inputReadOnly
                            />
                        </li>


                        <li> progress: <input value={this.state.progress} onChange={this.trackProgress} type='range'/>
                            <div className="progress">
                                <div className="progress-bar" role="progressbar"
                                     aria-valuemin="0" aria-valuemax="100" style={{width: this.state.progress + '%'}}>
                                    {this.state.progress}%
                                </div>
                            </div>
                        </li>
                    </ul>
                    <button className="btn btn-success btn-sm" onClick={() => this.toggleEdit(true)}> save</button>
                </div>
            )
        }

    }
}

class TimeLeftTimer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timer:moment().format(),
            interval:''
        }

        this.timer = this.timer.bind(this);
    }

    timer() {
        console.log('timer runnning')
        let currentTime = moment.tz(this.props.timezone)
        let difference = moment.duration(this.props.deadlineDate.diff(currentTime))
        this.setState({
            timer: difference.days() + 'd ' + difference.hours() + 'h ' + difference.minutes() + 'm '
                + difference.seconds() + 's'
        })
    }



    componentDidMount() {
        this.setState({interval:setInterval(this.timer,1000)})
    }

    componentWillUnmount() {
        clearInterval(this.state.interval)
    }

    render() {
        return (
            <div>
                {this.state.timer}
            </div>
        )

    }

}


// ReactDOM.render(
//     <App/>,
//     document.getElementById('root')
// );


export default App;

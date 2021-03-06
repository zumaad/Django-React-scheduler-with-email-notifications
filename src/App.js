import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import 'react-day-picker/lib/style.css';
import './App.css';

let moment = require('moment-timezone');
let jQuery = require('jquery')
let backend_url = 'http://schedulingfor.me/'

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

function combineDate(dateObj, hoursObj) {
    let combinedDate = new Date(dateObj.toLocaleDateString())
    combinedDate.setHours(hoursObj.hours())
    combinedDate.setMinutes(hoursObj.minutes())
    let newDeadlineDate = moment(combinedDate);
    return newDeadlineDate
}


class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            errorMessage: '',
            schedule: ''
        }
        this.toggleUserSchedule = this.toggleUserSchedule.bind(this);
        this.trackUsername = this.trackUsername.bind(this);
        this.trackPassword = this.trackPassword.bind(this);
        this.validateUser = this.validateUser.bind(this);
        this.fetchData = this.fetchData.bind(this)

    }

    render() {
        if (!this.state.schedule) {
            return (
                <div className='main'>
                    <div className="jumbotron text main">
                        <p className='jumbo-text'> Sign in</p>
                        <div>
                            <input onChange={this.trackUsername} value={this.state.username} placeholder='username'
                                   required='true'/>
                        </div>
                        <div>
                            <input type='password' onChange={this.trackPassword} value={this.state.password}
                                   placeholder='password' required='true'/>
                        </div>
                        <br></br>
                        <div>
                            <button onClick={this.toggleUserSchedule} className="btn btn-success"> Sign in!</button>
                        </div>
                        <p style={{color: 'red'}}>{this.state.errorMessage}</p>
                    </div>
                </div>)
        } else {
        return <App username={this.state.username} password={this.state.password} schedule=
            {this.state.schedule}/>
        }

    }

    fetchData() {
        let myData = {
            username: this.state.username,
            password: this.state.password
        }

        fetch(backend_url+'signIn/', {
            method: "post",
            credentials: "same-origin",
            headers: {
                'X-CSRFToken': getCookie("csrftoken"),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(myData)
        })
            .then(response => response.json())
            .then(data => this.validateUser(data)
            ).catch(function (ex) {
            console.log("parsing failed", ex);
        });

    }

    toggleUserSchedule() {
        if (!this.state.username || !this.state.password) {
            this.setState({errorMessage: 'You have to fill out both the password and username fields'})
        } else {
            this.fetchData()
        }


    }

    trackUsername(event) {
        this.setState({username: event.target.value})
    }

    trackPassword(event) {
        this.setState({password: event.target.value})
    }

    validateUser(data) {
        if (data === 'Incorrect password' || data === 'username does not exist') {
            this.setState({errorMessage: data})
        } else {
            this.setState({schedule: data})
        }

    }
}


class App extends React.Component {
    constructor(props) {
        super(props)
        if (this.props.schedule === 'None') {
            this.state = {
                categories: {},
                potentialCategory: '',
                timezone: 'America/New_York',
                keyCount: 0,
                timezoneMapping: {
                    'America/Chicago': 'Central', 'America/Denver': 'Mountain', 'America/Los_Angeles': 'Pacific',
                    'America/New_York': 'Eastern'
                },
                name: this.props.username,
                tasksCompleted: 0,
                hasChanged: false,
                updateFail: false,
                displayUpdateSuccess: false,
                notificationMap: {},
                whichView: 'Overall'
            }
        } else {
            this.state = this.props.schedule
        }


        this.trackCategoryInput = this.trackCategoryInput.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.recursiveDeepClone= this.recursiveDeepClone.bind(this);
        this.addTask = this.addTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.timezoneListener = this.timezoneListener.bind(this);
        this.markAsComplete = this.markAsComplete.bind(this);
        this.pushData = this.pushData.bind(this);
        this.pushDataHelper = this.pushDataHelper.bind(this);
        this.displayUpdateSuccess = this.displayUpdateSuccess.bind(this);
        this.cleanNotificationMap = this.cleanNotificationMap.bind(this);
        this.switchViews = this.switchViews.bind(this)


    }

    switchViews() {
        if (this.state.whichView === 'sorted') {
            this.setState({whichView: 'Overall'})
        } else {
            this.setState({whichView: 'sorted'})
        }

    }




    recursiveDeepClone(obj) {
        let deepClone = {};
        for (let i in obj) {
            if (obj[i] != null && typeof (obj[i]) == "object")
                deepClone[i] = this.recursiveDeepClone(obj[i]);
            else
                deepClone[i] = obj[i];
        }
        return deepClone;
    }

    trackCategoryInput(e) {
        this.setState({potentialCategory: e.target.value})
    }

    addCategory() {
        if (this.state.potentialCategory.length > 0) {
            let copiedState = this.recursiveDeepClone(this.state);


            copiedState.categories[copiedState.potentialCategory] = {};

            this.setState(state => ({
                categories: copiedState.categories,
                hasChanged: true
            }))
            this.setState({potentialCategory: ''})
        } else {
            alert("you need to give the category a name")
        }


    }

    //i am using state right after setting it, since its async it might be a problem, could use callback
    addTask(e, taskName) {
        // let potentialTask = this.state.potentialTask;
        if (taskName.length < 1) {
            alert("you need to name your task")
            return
        }
        this.setState(state => ({
            keyCount: state.keyCount + 1
        }))

        let categoryToAddTo = e.target.value
        let copiedState = this.recursiveDeepClone(this.state);
        copiedState.categories[categoryToAddTo][taskName] = {
            hasDeadline: false,
            hasDeadlineHour: false,
            deadline: '',
            progress: 0,
            priority: '',
            deadlineHour: '',
            key: this.state.keyCount,
            note: '',
            notificationDate: '',
            notificationHour: ''
        };
        this.setState(state => ({
            categories: copiedState.categories,
            hasChanged: true
            // potentialTask:''
        }))


    }

    deleteTask(nameAndCategory) {
        let category = nameAndCategory.category;
        let taskName = nameAndCategory.name;
        let copiedNotificationMap = this.recursiveDeepClone(this.state.notificationMap)
        if (taskName in copiedNotificationMap) {
            delete copiedNotificationMap[taskName]
        }

        let copiedCategories = this.recursiveDeepClone(this.state.categories);
        delete copiedCategories[category][taskName];

        this.setState(state => ({
            categories: copiedCategories,
            hasChanged: true,
            notificationMap: copiedNotificationMap
        }))

    }

    deleteCategory(e) {
        let categoryName = e.target.value;
        let copiedCategories = this.recursiveDeepClone(this.state.categories);
        let copiedNotificationMap = this.recursiveDeepClone(this.state.notificationMap)
        for (let task in copiedCategories[categoryName]) {
            if (task in copiedNotificationMap) {
                delete copiedNotificationMap[task]
            }
        }
        delete copiedCategories[categoryName];


        this.setState(state => ({
            categories: copiedCategories,
            hasChanged: true,
            notificationMap: copiedNotificationMap
        }))

    }

    updateItem(itemState) {
        let copiedCategories = this.recursiveDeepClone(this.state.categories);
        let itemName = itemState.name
        let itemCategory = itemState.category;
        let newDeadline = itemState.deadline;
        let newProgress = itemState.progress;
        let newDeadlineHour = itemState.deadlineHour;
        let hasDeadline = itemState.hasDeadline;
        let hasDeadlineHour = itemState.hasDeadlineHour;
        let key = itemState.id;
        let itemNotes = itemState.note
        let notificationDate = itemState.notificationDate;
        let notificationHour = itemState.notificationHour;
        let copiedNotificationMap = this.recursiveDeepClone(this.state.notificationMap)


        if (notificationDate && notificationHour) {
            copiedNotificationMap[itemName] = {date: notificationDate, hour: notificationHour}
        }


        copiedCategories[itemCategory][itemName] = {
            hasDeadline: hasDeadline,
            hasDeadlineHour: hasDeadlineHour,
            deadline: newDeadline,
            progress: newProgress,
            priority: 'NA',
            deadlineHour: newDeadlineHour,
            key: key,
            note: itemNotes,
            notificationDate: notificationDate,
            notificationHour: notificationHour
        }

        this.setState(state => ({
            categories: copiedCategories,
            hasChanged: true,
            notificationMap: copiedNotificationMap
        }))
    }


    timezoneListener(event) {
        let timezoneval = event.target.value
        this.setState(state => ({timezone: timezoneval}));

    }

    markAsComplete(nameAndCategory) {
        let category = nameAndCategory.category;
        let taskName = nameAndCategory.name;

        let copiedCategories = this.recursiveDeepClone(this.state.categories);
        delete copiedCategories[category][taskName];

        this.setState(state => ({
            categories: copiedCategories,
            tasksCompleted: this.state.tasksCompleted + 1,
            hasChanged: true
        }))
    }

    pushData() {
        let userData = {schedule: this.state, username: this.props.username, password: this.props.password}
        fetch(backend_url+'update/', {
            method: "post",
            credentials: "same-origin",
            headers: {
                'X-CSRFToken': getCookie("csrftoken"),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        }).then(function (response) {
            return response.json();
        }).then(data =>
            this.displayUpdateSuccess()
        ).catch(ex => {
            this.setState({
                updateFail: true,
                hasChanged: true
            })
        });
    }

    cleanNotificationMap() {
        console.log("cleaning notification map")
        console.log("b4", this.state.notificationMap)
        let copiedNotificationMap = this.recursiveDeepClone(this.state.notificationMap)
        for (let task in copiedNotificationMap) {
            let date = copiedNotificationMap[task].date
            let hour = copiedNotificationMap[task].hour
            let currentTime = moment.tz(this.state.timezone)
            let fullNotificationDate = combineDate(new Date(date), moment(hour)).tz(this.state.timezone);
            if (fullNotificationDate.isBefore(currentTime)) {
                console.log("deleting", task)
                delete copiedNotificationMap[task]
            }
        }
        /*
        make sure that push data is only called after notificationmap is cleaned
         */
        this.setState({notificationMap: copiedNotificationMap}, () => this.pushData())

    }

    /*
    Since setState is async, need to use push data as callback to ensure that it is called only after
    state is actually changed(referring to when hasChanged is set to false).
     */
    pushDataHelper() {
        this.setState({hasChanged: false}, () => {
            this.cleanNotificationMap()
        })
    }

    /*
    shows that the update was successful for three seconds
     */
    displayUpdateSuccess() {
        if (!this.state.displayUpdateSuccess) {
            this.setState({updateFail: false, displayUpdateSuccess: true}, () => {
                setTimeout(() => this.setState({displayUpdateSuccess: false}), 3000)
            })
        }


    }

    render() {
        let viewSpecificContent = ''
        let hasChangedMessage = ''
        let updateFailedMessage = ''
        let updateSuccessMessage = ''
        let sortedButtonText = ''
        if (this.state.whichView === 'sorted') {
            viewSpecificContent = <SortedView schedule={this.state.categories}
                                              updateItemFunc={this.updateItem}
                                              deleteTaskFunc={this.deleteTask}
                                              markAsCompleteFunc={this.markAsComplete}
                                              timezone = {this.state.timezone}/>
            sortedButtonText = 'Switch to overall view'
        } else {
            sortedButtonText = 'Switch to sorted view'
            viewSpecificContent =
                <div>
                    <div className="align text">
                        <h2>Add to your schedule</h2>
                        <input id="categoryInput" onChange={this.trackCategoryInput}
                               value={this.state.potentialCategory}
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
                                  trackingTask={this.state.potentialTask}
                                  markAsCompleteFunc={this.markAsComplete}

                    />
                </div>
        }

        if (this.state.hasChanged) {
            hasChangedMessage =
                <p style={{color: 'red'}}> Your schedule has changed since loading, make sure to save before
                    exiting!</p>
        } else {
            hasChangedMessage = <p style={{color: 'yellow'}}> No changes detected since last save</p>

        }
        if (this.state.updateFail) {
            updateFailedMessage =
                <p style={{color: 'red'}}>Your changes weren't able to be pushed to the server, check your internet
                    connection.</p>

        }
        if (this.state.displayUpdateSuccess) {
            updateSuccessMessage = <p style={{color: 'lawngreen'}}> Data pushed successfully to server!</p>
        }
        return (
            <div className='main'>
                <div className="jumbotron text main">
                    <p className="jumbo-text"> Make a Schedule!</p>
                    <p>Welcome, {this.state.name}</p>
                    You've completed {this.state.tasksCompleted} tasks so far
                    <br></br><br></br><br></br>
                    <div>
                        <button className="btn btn-success" onClick={this.pushDataHelper}> save your changes!</button>
                        {hasChangedMessage}
                        {updateFailedMessage}
                        {updateSuccessMessage}
                    </div>
                </div>
                <div className="align">
                    <button className="btn btn-info" onClick={this.switchViews}> {sortedButtonText}</button>
                </div>
                {viewSpecificContent}
            </div>
        )
    }
}

class SortedView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            schedule: this.props.schedule,
            keyCount: this.props.keyCount
        }


        this.compareDates = this.compareDates.bind(this);
        this.sortTask = this.sortTask.bind(this);
    }

    componentWillMount() {
        this.sortTask()
    }


    compareDates(task1, task2) {
        //if task1 doesn't have a deadline but task2 does, put task2 before task1
        if (!task1.deadline && task2.deadline) {
            return 1
        }

        if (task1.deadline && !task2.deadline) {
            return -1
        }
        let task1Date = combineDate(new Date(task1.deadline), moment(task1.deadlineHour))
        let task2Date = combineDate(new Date(task2.deadline), moment(task2.deadlineHour))
        return task1Date.valueOf() - task2Date.valueOf()


    }

    sortTask() {
        let copiedTaskList = []
        for (let category in this.props.schedule) {
            let tasklist = this.props.schedule[category]
            for (let task in tasklist) {
                let copiedTask = tasklist[task]
                copiedTask['name'] = task
                copiedTask['category'] = category
                copiedTaskList.push(copiedTask)
            }
        }

        copiedTaskList.sort(this.compareDates)
        return copiedTaskList
    }

    render() {
        let copiedTaskList = this.sortTask()
        return (

            <div className='align'>
                <br/>
                {copiedTaskList.map((task) =>
                    <div className='text'>
                        <Item category={task['category']}
                              deleteTaskFunc={this.props.deleteTaskFunc}
                              taskName={task['name']}
                              task={task}
                              updateItemFunc={this.props.updateItemFunc}
                              key={task['key']}
                              id={task['key']}
                              timezone={this.props.timezone}
                              trackingTask={this.props.trackingTask}
                              markAsCompleteFunc={this.props.markAsCompleteFunc}
                        />
                    </div>
                )}
            </div>)


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
                                  trackingTask={this.props.trackingTask}
                                  markAsCompleteFunc={this.props.markAsCompleteFunc}
                        />
                    </div>)}
            </div>)
    }

}

class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
            potentialTask: ''
        }

        this.collapseOrExpand = this.collapseOrExpand.bind(this);
        this.trackTask = this.trackTask.bind(this);
        this.pushPotentialTask = this.pushPotentialTask.bind(this);
    }

    collapseOrExpand() {
        if (this.state.collapsed) {
            this.setState({collapsed: false})
        } else {
            this.setState({collapsed: true})
        }
    }

    trackTask(event) {
        this.setState({potentialTask: event.target.value})
    }

    pushPotentialTask(event, potentialTask) {
        this.setState({potentialTask: ''})
        this.props.addTaskFunc(event, potentialTask)
    }


    //why cant i assign the difference in renders to a variable and then stick that variable in the body??
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
                    <input onChange={this.trackTask} value={this.state.potentialTask} placeholder="task name"/>
                    <button className="btn btn-success btn-sm" value={this.props.categoryName}
                            onClick={(e) => this.pushPotentialTask(e, this.state.potentialTask)}> add task
                    </button>
                    <br></br><br></br>
                    <ItemList category={this.props.categoryName}
                              deleteTaskFunc={this.props.deleteTaskFunc}
                              items={this.props.items}
                              updateItemFunc={this.props.updateItemFunc}
                              timezone={this.props.timezone}
                              collapsed={this.state.collapsed}
                              markAsCompleteFunc={this.props.markAsCompleteFunc}
                    />
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
                              collapsed={this.props.collapsed}
                              key={this.props.items[key].key}
                              id={this.props.items[key].key}
                              trackingTask={this.props.trackingTask}
                              markAsCompleteFunc={this.props.markAsCompleteFunc}
                        />
                    </div>)}
            </div>
        )
    }
}

const format = 'h:mm a';


class Item extends React.Component {
    constructor(props) {
        console.log('item constructor')
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
            id: this.props.id,
            note: this.props.task.note,
            notificationDate: this.props.task.notificationDate,
            notificationHour: this.props.task.notificationHour
        }


        this.toggleEdit = this.toggleEdit.bind(this);
        this.trackDeadline = this.trackDeadline.bind(this);
        this.trackProgress = this.trackProgress.bind(this);
        this.trackDeadlineHour = this.trackDeadlineHour.bind(this);
        this.trackNotes = this.trackNotes.bind(this);
        this.trackNotificationDate = this.trackNotificationDate.bind(this);
        this.trackNotificationHour = this.trackNotificationHour.bind(this);
    }

    componentWillUnmount() {
        console.log("item unmounted!")
    }

    //clean up these conditionals,looks bad.
    toggleEdit(pushChanges) {

        if (this.state.inEditingMode && (!this.state.hasDeadline || !this.state.hasDeadlineHour)) {
            alert("you have to enter both a deadline date and deadline hour!")
            return
        } else if (this.state.inEditingMode && ((this.state.notificationDate && !this.state.notificationHour) ||
            (!this.state.notificationDate && this.state.notificationHour))) {
            alert('you need to fill out both notification date and hour, or leave them both blank.')
            return
        } else if (this.state.inEditingMode && this.state.hasDeadline && this.state.hasDeadlineHour) {
            this.setState({inEditingMode: false})
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



    trackNotes(event) {
        this.setState({note: event.target.value})
    }

    //to iso string maybe timezone naive, so maybe errors?
    trackNotificationDate(day) {

        this.setState({notificationDate: day.toISOString()})
    }

    trackNotificationHour(hour) {

        this.setState({notificationHour: hour.format()})
    }

    render() {
        console.log("item key",this.props.id)
        let deadline = ''
        let timeLeft = ''
        let deadlineHourPlaceHolder = 'pick an hour'
        let deadlineDatePlaceholder = 'pick a date'
        let notes = ''
        let notificationDatePlaceholder = 'pick a date'
        let notificationHourPlaceholder = 'pick an hour'
        let notificationDate = <p style={{color: '#FF652F'}} id='notes'><b> edit and pick a date and time to be notified
            at</b></p>

        if (this.state.notificationDate && this.state.notificationHour) {
            notificationDate =
                <p style={{color: '#FF652F'}}> {new Date(this.state.notificationDate).toLocaleDateString() + ' ' + moment(this.state.notificationHour).format(format)}</p>
            notificationDatePlaceholder = new Date(this.state.notificationDate).toLocaleDateString()
            notificationHourPlaceholder = moment(this.state.notificationHour).format(format)
        }

        if (!this.state.note) {
            notes = <p style={{color: '#FF652F'}} id='notes'><b>edit to write notes.</b></p>
        } else {
            notes = <p style={{color: '#FF652F'}} id='notes'> {this.state.note}</p>
        }


        //if the user has entered a date and a time for the task
        if (this.state.hasDeadline && this.state.hasDeadlineHour) {
            deadline = new Date(this.state.deadline).toLocaleDateString() + ' ' + moment(this.state.deadlineHour).format(format)
            deadlineDatePlaceholder = new Date(this.state.deadline).toLocaleDateString()
            deadlineHourPlaceHolder = moment(this.state.deadlineHour).format(format)

            let currentTime = moment.tz(this.props.timezone)
            let fullDeadlineDate = combineDate(new Date(this.state.deadline), moment(this.state.deadlineHour)).tz(this.props.timezone)

            timeLeft = <TimeLeftTimer
                timezone={this.props.timezone}
                deadlineDate={fullDeadlineDate}
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
                        <h3 style={{margin: 0}}><b>{this.props.taskName}</b></h3>
                        <button className="btn btn-warning btn-xs" onClick={() => this.toggleEdit(false)}> Edit</button>
                        <button
                            onClick={() => this.props.deleteTaskFunc({
                                category: this.props.category,
                                name: this.props.taskName
                            })}
                            className="btn btn-danger btn-xs"> Delete
                        </button>
                        <button className="btn btn-success btn-xs2"
                                onClick={() => this.props.markAsCompleteFunc({
                                    category: this.props.category,
                                    name: this.props.taskName
                                })}>
                            Mark as complete!
                        </button>

                    </div>

                    <ul>
                        <li> deadline:<span style={{color: '#FF652F'}}>{deadline}</span></li>
                        <li> time left:<span style={{color: '#FF652F'}}> {timeLeft}</span></li>
                        <li>
                            progress:
                            <div className="progress">
                                <div className="progress-bar" role="progressbar" aria-valuenow="70"
                                     aria-valuemin="0" aria-valuemax="100" style={{width: this.state.progress + '%'}}>
                                    {this.state.progress}%
                                </div>
                            </div>
                        </li>
                        <li>Notes:{notes} </li>
                        <li>Notification Date: {notificationDate}</li>
                    </ul>
                </div>
            )
        } else {

            return (
                <div className="align itembox">
                    <h5> {this.props.taskName} </h5>
                    <ul>
                        <li> deadline:
                            <DayPickerInput
                                placeholder={deadlineDatePlaceholder}
                                onDayChange={day => this.trackDeadline(day)}
                            />
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
                        <li> notes: <textarea value={this.state.note} onChange={this.trackNotes}
                                              className='form-control' rows='4'> </textarea></li>
                        <li> set notication date:
                            <DayPickerInput
                                placeholder={notificationDatePlaceholder}
                                onDayChange={day => this.trackNotificationDate(day)}
                            />
                            <TimePicker
                                showSecond={false}
                                placeholder={notificationHourPlaceholder}
                                className="xxx"
                                onChange={value => this.trackNotificationHour(value)}
                                format={format}
                                use12Hours
                                inputReadOnly
                            />
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
            timer: moment().format(),
            interval: ''
        }

        this.timer = this.timer.bind(this);
    }

    timer() {
        console.log('timer running')
        let currentTime = moment.tz(this.props.timezone)
        let difference = moment.duration(this.props.deadlineDate.diff(currentTime))
        if (this.props.deadlineDate.isBefore(currentTime)) {
            this.setState({timer: <span style={{color: 'red'}}>deadline passed!</span>})
            clearInterval(this.state.interval)

        } else {
            this.setState({
                timer: difference.days() + 'd ' + difference.hours() + 'h ' + difference.minutes() + 'm '
                    + difference.seconds() + 's'
            })
        }

    }


    componentDidMount() {
        this.setState({interval: setInterval(this.timer, 1000)})
    }

    componentWillUnmount() {
        clearInterval(this.state.interval)
    }

    render() {
        return (
            <div style={{color: '#FF652F'}}>
                {this.state.timer}
            </div>
        )

    }

}


// ReactDOM.render(
//     <App/>,
//     document.getElementById('root')
// );


export default HomePage;

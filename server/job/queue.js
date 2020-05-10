const Job = require('./job');

module.exports = class Queue {

  get hasJobs() {
    return this.queue.size === 0
  }

  get getTask() {
    return this.queue.values().next();
  }

  constructor() {
    this.queue = new Set();
  }

  _testTask(task) {
    if (!(task instanceof Job)) {
      throw new Error('task should be instance of Job');
    }
  }
  
  addTask(task) {
    this._testTask(task);

    this.queue.forEach((taskJob) => {
      if (taskJob.uuid === task.uuid) {
        throw new Error('Such task id already exist');
      }
    });

    this.queue.add(task);

    return task;
  }

  removeTask(task) {
    if (!task || !this.hasJobs) {
      return null;
    }

    this._testTask(task);
    this.queue.delete(task);
  }
}

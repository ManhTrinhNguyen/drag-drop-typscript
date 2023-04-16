// Project State Management

class ProjectState {
  private listeners: any[] = []
  private projects: any[] = [];
  private static instance: ProjectState
  private constructor() { };

  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState();
    return this.instance
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn)
  }

  addProjects(title: string, description: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: people
    };
    this.projects.push(newProject);
    for (const listenrFn of this.listeners) {
      listenrFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();
console.log(projectState)

// Validate 
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0 
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }
  if (validatableInput.min != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }
  if (validatableInput.max != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }
  return isValid
}


// Autobind Decorator 
function AutoBind(_: any, _1: any, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  };

  return adjDescriptor;
  
}

// Project List class 
class ProjectLists {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.element = document.getElementById("projects")! as HTMLElement;
    this.assignedProjects = []

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects
      this.renderProjects();
    });
    this.attach()
    this.renderContent()
  } 
 

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem)
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element)
  }
}

// Project input Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement  = document.getElementById("project-input")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement
    this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement
    
    this.configure()
    this.attach()
  }

  private gatherUserInput(): [string, string, number] | void {
    const enterTitle = this.titleInputElement.value
    const enterDescription = this.descriptionInputElement.value
    const enterPeople = this.peopleInputElement.value
    const titleValidatable: Validatable = {
      value: enterTitle,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: enterDescription,
      required: true,
      minLength: 5
    };
    const peopleValidatable: Validatable = {
      value: +enterPeople,
      required: true,
      min: 1,
      max: 5
    };

    if (!validate(titleValidatable) || !validate(peopleValidatable) || !validate(descriptionValidatable)) {
      alert("Invalid input, please try again")
      return;
    } else {
      return [enterTitle, enterDescription, +enterPeople]
    }
  }

  private clearInputs() {
    this.titleInputElement.value = ""
    this.descriptionInputElement.value = ""
    this.peopleInputElement.value = ""
  }
  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProjects(title, desc, people)
      this.clearInputs()
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler)
  } 
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element)
  }
}

const newInput = new ProjectInput;
const activePrjList = new ProjectLists("active");
const finishedPrjList = new ProjectLists("finished")



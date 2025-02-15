import Modeler from "bpmn-js/lib/Modeler";
import EventEmitter from "@utils/EventEmitter";
import { catchError } from "@utils/printCatch";
import EnhancementContextmenu from "@packages/additional-components/EnhancementContextmenu";
import { addExtensionProperty } from "@packages/bo-utils/extensionPropertiesUtil";

export default function (designerDom, moduleAndExtensions, context) {
  const options = {
    container: designerDom,
    additionalModules: moduleAndExtensions[0] || [],
    moddleExtensions: moduleAndExtensions[1] || {},
    ...moduleAndExtensions[2]
  };

  // 清除旧 modeler
  context.getModeler && context.getModeler.destroy();
  context.$store.commit("clearBpmnState");

  const modeler = new Modeler(options);

  context.$store.commit("setModeler", modeler);

  EventEmitter.emit("modeler-init", modeler);

  modeler.on("commandStack.changed", async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true });

      context.$emit("update:xml", xml);
      context.$emit("command-stack-changed", event);
    } catch (error) {
      catchError(error);
    }
  });

  modeler.on("commandStack.elements.create.preExecute", (event) => {
    console.log("create", event);
    const {
      context: { elements }
    } = event;
    if (elements[0] && elements[0].type === "bpmn:UserTask") {
      addExtensionProperty(elements[0], { name: "111", value: "1231" });
    }
    return event;
  });

  modeler.on("commandStack.shape.replace.preExecute", (event) => {
    console.log("replace", event);
    debugger;
    const {
      context: { newShape, newData }
    } = event;
    if (newData && newData.type === "bpmn:UserTask") {
      console.log(1111);
      addExtensionProperty(newData.businessObject, { name: "111", value: "1231" });
    }
    return event;
  });

  EnhancementContextmenu(modeler, context.getEditor);

  return modeler;
}

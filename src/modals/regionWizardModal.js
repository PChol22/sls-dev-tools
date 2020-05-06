import { Box } from "../components/box";
import { ModalLayout } from "../components/modalLayout";
import { ModalTitle } from "../components/modalTitle";
import { InteractiveList } from "../components/interactiveList";
import { awsRegionLocations } from "../constants";

function updateRegionTable(table) {
  const regions = awsRegionLocations.map((region) => region.label);
  table.setItems(regions);
}

const regionWizardModal = (screen, application) => {
  let region = "";
  const wizardLayout = new ModalLayout(screen, 112, 27, true);

  const closeModal = () => {
    wizardLayout.destroy();
  };

  new ModalTitle(wizardLayout, 110, "Select your region");

  const regionTable = new InteractiveList(wizardLayout, 110, 20, "Regions");

  new Box(
    wizardLayout,
    110,
    4,
    "Arrow keys to navigate | ENTER to select region"
  );

  updateRegionTable(regionTable);
  regionTable.focus();

  regionTable.key(["enter"], () => {
    region = regionTable.ritems[regionTable.selected];
    application.updateRegion(region);
    closeModal();
    application.returnFocus();
    if (!application.program.stackName) {
      application.promptStackName();
    } else {
      application.render();
    }
  });

  screen.render();
  return regionTable;
};

module.exports = { regionWizardModal };

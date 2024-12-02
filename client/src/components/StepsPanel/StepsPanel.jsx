// Imports
import React from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMousePointer,
  faFileAlt,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./../components-css/StepsPanel.css";

export default function StepsPanel() {
  return (
    <div className="steps-panel">
      <h3 className="text-center mb-4">3 Easy Steps to Create a Request</h3>

      {/* Step 1 */}
      <Card className="step-card mb-3">
        <Card.Body className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faMousePointer}
            size="2x"
            className="me-3 text-primary"
          />
          <div>
            <h5>Step #1</h5>
            <p>Click the "Request Now" button</p>
          </div>
        </Card.Body>
      </Card>

      {/* Step 2 */}
      <Card className="step-card mb-3">
        <Card.Body className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faFileAlt}
            size="2x"
            className="me-3 text-primary"
          />
          <div>
            <h5>Step #2</h5>
            <p>Fill-out the request form</p>
          </div>
        </Card.Body>
      </Card>

      {/* Step 3 */}
      <Card className="step-card">
        <Card.Body className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faCalendarCheck}
            size="2x"
            className="me-3 text-primary"
          />
          <div>
            <h5>Step #3</h5>
            <p>Set appointment date and wait for confirmation</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
